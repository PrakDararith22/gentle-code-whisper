import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, image } = await req.json();
    
    // Extract user from JWT token
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    let userId = null;
    
    // Initialize Supabase client
    // Supabase automatically provides these env vars in Edge Functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPA_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }
    
    console.log('Received request:', { prompt: prompt?.substring(0, 50), userId, hasImage: !!image });

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Valid prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let imageUrl: string | null = null;

    // Handle image upload if provided
    if (image) {
      try {
        console.log('Processing image upload...');
        
        // Extract base64 data
        const base64Data = image.includes('base64,') 
          ? image.split('base64,')[1] 
          : image;
        
        // Convert base64 to Uint8Array
        const imageData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        // Generate unique filename
        const fileName = `${crypto.randomUUID()}.png`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-images')
          .upload(fileName, imageData, {
            contentType: 'image/png',
            upsert: false
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('user-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
        console.log('Image uploaded successfully:', imageUrl);
      } catch (error) {
        console.error('Error processing image:', error);
        // Continue without image if upload fails
      }
    }

    // Call Google Gemini API for code generation
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Calling Google Gemini API...');

    // Build system instruction and user prompt
    const systemInstruction = 'You are a code assistant. Generate clean, well-structured code based on user prompts. Only return valid code unless the action is "explain". For fix requests, return the corrected code. For explain requests, provide clear explanations.';
    
    // Build content parts for Gemini API
    const parts: any[] = [
      { text: `${systemInstruction}\n\nUser request: ${prompt}` }
    ];

    // Add image if provided
    if (imageUrl) {
      // Fetch image and convert to base64 for Gemini
      try {
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBlob)));
        
        parts.push({
          inline_data: {
            mime_type: 'image/png',
            data: base64Image
          }
        });
      } catch (error) {
        console.error('Error fetching image for Gemini:', error);
        // Continue without image
      }
    }

    // Use Gemini 2.0 Flash (or gemini-1.5-flash for stability)
    const model = 'gemini-2.0-flash-exp';
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: parts
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Gemini API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ status: 'error', message: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 403) {
        return new Response(
          JSON.stringify({ status: 'error', message: 'Invalid API key or quota exceeded.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Gemini API error: ${aiResponse.status} ${errorText}`);
    }

    const aiData = await aiResponse.json();
    
    // Extract generated text from Gemini response format
    const generatedCode = aiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Error: No response generated';

    console.log('Code generated successfully');

    // Store in history table
    const { error: insertError } = await supabase
      .from('history')
      .insert({
        user_id: userId || null,
        prompt: prompt,
        response: generatedCode,
        image_url: imageUrl
      });

    if (insertError) {
      console.error('Error inserting history:', insertError);
      // Continue even if history insert fails
    }

    // Return success response
    return new Response(
      JSON.stringify({
        status: 'success',
        code: generatedCode,
        image_url: imageUrl
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate function:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
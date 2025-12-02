# Deploying Swagger UI Documentation

## Quick Start

Deploy the Swagger UI function to make your API documentation accessible:

```powershell
# Deploy the swagger-ui function
supabase functions deploy swagger-ui

# Verify deployment
supabase functions list
```

## Access Your Documentation

After deployment, access your API documentation at:

**Production URL**:
```
https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/swagger-ui
```

**Local Development** (if running Supabase locally):
```
http://localhost:54321/functions/v1/swagger-ui
```

## Testing CORS

Verify that CORS is working correctly:

```powershell
# Test CORS on newsletter-signup endpoint
curl -H "Origin: https://example.com" -I https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/newsletter-signup

# Expected response should include:
# Access-Control-Allow-Origin: *
```

## Deployment Commands

### Deploy All Functions (if needed)
```powershell
supabase functions deploy
```

### Deploy Only Swagger UI
```powershell
supabase functions deploy swagger-ui
```

### View Function Logs
```powershell
supabase functions logs swagger-ui
```

## Troubleshooting

### Function Not Found
If you get a 404 error:
1. Ensure you've deployed the function: `supabase functions deploy swagger-ui`
2. Check the function is listed: `supabase functions list`
3. Verify your project ID in the URL

### CORS Issues
If you encounter CORS errors:
1. Check that the function includes CORS headers
2. Verify the OPTIONS request is handled
3. All functions already have CORS configured with `Access-Control-Allow-Origin: *`

### Swagger UI Not Loading
If the Swagger UI interface doesn't load:
1. Check browser console for errors
2. Verify the OpenAPI spec is valid JSON
3. Check function logs: `supabase functions logs swagger-ui`

## Next Steps

1. ✅ Deploy the swagger-ui function
2. ✅ Access the documentation URL
3. ✅ Share the URL with your team
4. ✅ Test API endpoints using the "Try it out" feature

## Notes

- The swagger-ui function is configured with `verify_jwt = false` for public access
- No authentication is required to view the documentation
- The OpenAPI spec can be downloaded as JSON for use with code generation tools
- All 51 endpoints are documented and ready to test

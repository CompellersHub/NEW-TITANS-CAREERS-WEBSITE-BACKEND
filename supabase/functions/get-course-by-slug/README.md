# Get Course By Slug Function

## Overview
This Edge Function retrieves course details by slug instead of by ID. This is useful for creating SEO-friendly URLs and easier-to-remember course links.

## Endpoint
```
GET /functions/v1/get-course-by-slug?slug={course-slug}
```

## Parameters
- `slug` (required): The course slug identifier (e.g., "aml-compliance-course")

## Example Request
```bash
# You need to include the Supabase anon key in the apikey header
curl "https://bzxzsidcifkhedydujqb.supabase.co/functions/v1/get-course-by-slug?slug=aml-compliance-course" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY"
```

**Note**: While the function itself doesn't require user authentication, Supabase's API Gateway requires the `apikey` header with your project's anon key. This is a public key and safe to use in client-side code.

## Example Response
```json
{
  "course": {
    "id": "uuid-here",
    "slug": "aml-compliance-course",
    "title": "AML Compliance Professional",
    "description": "...",
    "image_url": "...",
    "price": 499.99,
    ...
  }
}
```

## Error Responses
- `400`: Course slug is required
- `404`: Course not found
- `500`: Internal server error

## Related Functions
- `get-course`: Get course by ID
- `get-courses`: Get all courses with filtering

## Deployment
To deploy this function:
```powershell
.\deploy-get-course-by-slug.ps1
```

## Documentation
This endpoint is documented in the Swagger UI at:
```
https://bzxzsidcifkhedydujqb.supabase.co/functions/v1/swagger-ui
```

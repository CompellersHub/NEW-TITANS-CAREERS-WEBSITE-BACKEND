# Adding /register Endpoint to Swagger UI

## Location
Add this to `supabase/functions/swagger-ui/openapi-spec.ts` after the `/me` endpoint (around line 1330).

## Code to Add

```typescript
        "/register": {
            post: {
                tags: ["Authentication"],
                summary: "User registration",
                description: "Register a new user account with email and password",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password", "username", "userType"],
                                properties: {
                                    email: { type: "string", format: "email", example: "newuser@example.com" },
                                    password: { type: "string", format: "password", example: "securePassword123" },
                                    username: { type: "string", example: "johndoe" },
                                    userType: { 
                                        type: "string", 
                                        enum: ["customusers", "bloguser", "teacherprofiles"],
                                        example: "customusers",
                                        description: "Type of user account to create"
                                    },
                                    firstName: { type: "string", example: "John" },
                                    lastName: { type: "string", example: "Doe" },
                                    role: { type: "string", example: "user" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "User registered successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: { type: "boolean", example: true },
                                        message: { type: "string", example: "User registered successfully" },
                                        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                                        user: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", format: "uuid" },
                                                email: { type: "string", format: "email" },
                                                username: { type: "string" },
                                                role: { type: "string" },
                                                userType: { type: "string" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "400": { description: "Missing required fields or invalid userType" },
                    "409": { description: "Email already registered" },
                    "500": { description: "Internal server error" },
                },
            },
        },
```

## Steps

1. Open `supabase/functions/swagger-ui/openapi-spec.ts`
2. Find the `/me` endpoint (around line 1330)
3. Add the above code after the `/me` endpoint closes (after its closing `},`)
4. Make sure it's before the `/get-event` endpoint
5. Save the file
6. Deploy: `npx -y supabase@2.64.2 functions deploy swagger-ui --project-ref bzxzsidcifkhedydujqb --no-verify-jwt`

## Result

The Swagger UI will now show the `/register` endpoint under the "Authentication" section with:
- Required fields: email, password, username, userType
- Optional fields: firstName, lastName, role
- userType options: customusers, bloguser, teacherprofiles

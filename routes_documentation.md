# API Routes Documentation

Base API prefix: `/api` (see `src/app.ts`). Auth routes are under `/api/auth`.

Notes:
- For routes that use `upload.fields(...)` the request should be sent as `multipart/form-data` and include the named file fields.
- Routes with `authenticate` require a valid auth token (see `src/middlewares/authMiddleware.ts`).
- This document lists method, full path, middlewares, controller handler and file fields where applicable.

---

**Auth Routes** (`src/routes/authRoutes.ts`)

- **POST** `/api/auth/register`
  - Middlewares: none
  - Handler: `register` (`src/controllers/authController`)
  - Body: JSON (user registration fields)

- **GET** `/api/auth/verify-email`
  - Middlewares: none
  - Handler: `verifyEmail` (`src/controllers/authController`)
  - Query: typically includes a token (see controller).

- **POST** `/api/auth/login`
  - Middlewares: none
  - Handler: `login` (`src/controllers/authController`)
  - Body: JSON (credentials)

- **POST** `/api/auth/refresh`
  - Middlewares: none
  - Handler: `refresh` (`src/controllers/authController`)
  - Body / Cookie: refresh token (see controller implementation)

- **POST** `/api/auth/logout`
  - Middlewares: none
  - Handler: `logout` (`src/controllers/authController`)

---

**General Info** (`src/routes/generalInfoRoute.ts`)

- **POST** `/api/general`
  - Middlewares: `authenticate`, `upload.none()` (no files)
  - Handler: `updateGeneralStep` (`src/controllers/generalInfo`)
  - Body: form fields / JSON; no file uploads

---

**Staff Info** (`src/routes/staffInfoRoute.ts`)

- **POST** `/api/staff`
  - Middlewares: `authenticate`, `upload.fields(...)`
  - Handler: `updateStaffStep` (`src/controllers/staffInfoController`)
  - File fields (multipart/form-data): `staff_statement`, `teacher_agreement`, `salary_scales` (each maxCount: 1)

---

**Partners Info** (`src/routes/partnerInfoRoute.ts`)

- **POST** `/api/update-partners`
  - Middlewares: `authenticate`, `upload.fields(...)`
  - Handler: `updatePartners` (`src/controllers/partnersInfoController`)
  - File fields: `partner1_signature`, `partner2_signature` (each maxCount: 1)

---

**Institute Documents** (`src/routes/InstituteDocRoute.ts`)

- **POST** `/api/institute-docs`
  - Middlewares: `authenticate`, `upload.fields(...)`
  - Handler: `updateInstituteDocs` (`src/controllers/instituteDocsController`)
  - File fields: `institute_doc`, `mission_statement_institute`, `application_to_secretory_ttb` (each maxCount: 1)

---

**Equipment Info** (`src/routes/equipmentInfoRoute.ts`)

- **POST** `/api/equipment`
  - Middlewares: `authenticate`, `upload.fields(...)`
  - Handler: `addEquipmentInfo` (`src/controllers/equipmentsInfoController`)
  - File fields: `lab_equipment_list`, `applied_trades_equipment`, `library_books_list`, `amount_spent` (each maxCount: 1)

---

**Financial Info** (`src/routes/financialInfoRoute.ts`)

- **POST** `/api/finance`
  - Middlewares: `authenticate`, `upload.fields(...)`
  - Handler: `updateFinancialStep` (`src/controllers/financialInfoController`)
  - File fields: `financial_document` (maxCount: 1)

---

**Building Info** (`src/routes/buildingInfoRoute.ts`)

- **POST** `/api/building`
  - Middlewares: `authenticate`, `upload.fields(...)`
  - Handler: `addBuildingInfo` (`src/controllers/buildingInfoController`)
  - File fields: `building_plan_attached`, `lease_copy_attached` (each maxCount: 1)

---

**Owners Info** (`src/routes/ownersInfoRoute.ts`)

- File present but empty: `src/routes/ownersInfoRoute.ts` — no routes declared. Confirm if you want an owners route and what path/handler to use.

---

---

**Authentication & Headers**

- **Auth**: Most API endpoints (except `/api/auth/*`) require authentication. Include the access token returned by `/api/auth/login` in the `Authorization` header:

  - Header: `Authorization: Bearer <accessToken>`

- **Refresh tokens**: `/api/auth/refresh` expects the refresh token in an httpOnly cookie named `refreshToken` (set by the server on login).

---

**Request / Response Examples**

For each endpoint below you'll find a concise request example and an example success response. For endpoints that accept files use `multipart/form-data` (examples use `curl`).

**Auth Routes** (`src/routes/authRoutes.ts`)

- **POST** `/api/auth/register`
  - Request (JSON):

    ```json
    { "name": "Alice School", "email": "alice@example.com", "password": "secret123" }
    ```

  - Success response:

    ```json
    { "message": "User registered. Please verify your email." }
    ```

- **GET** `/api/auth/verify-email?token=<token>`
  - Success response:

    ```json
    { "message": "Email verified successfully." }
    ```

- **POST** `/api/auth/login`
  - Request (JSON):

    ```json
    { "email": "alice@example.com", "password": "secret123" }
    ```

  - Success response (sets refresh cookie and returns access token):

    ```json
    { "accessToken": "<jwt-access-token>", "message": "Login successful" }
    ```

- **POST** `/api/auth/refresh`
  - Uses httpOnly cookie `refreshToken` set by login. Success response:

    ```json
    { "accessToken": "<new-access-token>", "message": "Token refreshed" }
    ```

- **POST** `/api/auth/logout`
  - Clears refresh cookie. Success response:

    ```json
    { "message": "Logged out" }
    ```

---

**General Info** (`src/routes/generalInfoRoute.ts`)

- **POST** `/api/general` (authenticated)
  - Request (JSON):

    ```json
    {
      "institute_name": "Sunrise Technical School",
      "address": "123 Main St, City",
      "trade_required": "Electrical",
      "classes_start_date": "2026-02-01T00:00:00.000Z"
    }
    ```

  - Success response:

    ```json
    { "success": true, "message": "General step updated successfully" }
    ```

---

**Staff Info** (`src/routes/staffInfoRoute.ts`)

- **POST** `/api/staff` (authenticated, multipart)
  - Form fields: `proposed_appointment` (string) and optional files below.
  - File fields (multipart): `staff_statement`, `teacher_agreement`, `salary_scales` (each one file)

  - curl (files + field):

    ```bash
    curl -X POST "http://localhost:5000/api/staff" \
      -H "Authorization: Bearer <accessToken>" \
      -F "proposed_appointment=Senior Instructor" \
      -F "staff_statement=@/path/to/staff_statement.pdf" \
      -F "teacher_agreement=@/path/to/teacher_agreement.pdf"
    ```

  - Success response:

    ```json
    { "success": true, "message": "Staff step updated successfully" }
    ```

---

**Partners Info** (`src/routes/partnerInfoRoute.ts`)

- **POST** `/api/update-partners` (authenticated, multipart)
  - Body fields: `partner1_name`, `partner1_cnic`, `partner2_name`, `partner2_cnic` (strings)
  - Optional file fields: `partner1_signature`, `partner2_signature`

  - curl example:

    ```bash
    curl -X POST "http://localhost:5000/api/update-partners" \
      -H "Authorization: Bearer <accessToken>" \
      -F "partner1_name=Ali" \
      -F "partner1_cnic=12345-6789012-3" \
      -F "partner1_signature=@/path/to/sign1.png"
    ```

  - Success response:

    ```json
    { "success": true, "message": "Partner information updated successfully" }
    ```

---

**Institute Documents** (`src/routes/InstituteDocRoute.ts`)

- **POST** `/api/institute-docs` (authenticated, multipart)
  - File fields: `institute_doc`, `mission_statement_institute`, `application_to_secretory_ttb` (each one file)

  - curl example:

    ```bash
    curl -X POST "http://localhost:5000/api/institute-docs" \
      -H "Authorization: Bearer <accessToken>" \
      -F "institute_doc=@/path/to/doc.pdf" \
      -F "mission_statement_institute=@/path/to/mission.pdf"
    ```

  - Success response:

    ```json
    { "success": true, "message": "Institute documents updated successfully" }
    ```

---

**Equipment Info** (`src/routes/equipmentInfoRoute.ts`)

- **POST** `/api/equipment` (authenticated)
  - This endpoint accepts either text fields OR files for the same logical fields; you cannot provide both for a single field.
  - Text fields (JSON or form fields): `lab_equipment_list`, `applied_trades_equipment`, `library_books_list`, `amount_spent` (strings)
  - File fields (multipart): `lab_equipment_list`, `applied_trades_equipment`, `library_books_list`, `amount_spent` (each one file)

  - JSON example (text inputs):

    ```json
    {
      "lab_equipment_list": "Microscopes x10; Soldering stations x5",
      "applied_trades_equipment": "Welding machines x2",
      "library_books_list": "Intro to Electronics; Applied Mechanics",
      "amount_spent": "50000"
    }
    ```

  - curl example (file upload for one field):

    ```bash
    curl -X POST "http://localhost:5000/api/equipment" \
      -H "Authorization: Bearer <accessToken>" \
      -F "lab_equipment_list=@/path/to/lab_list.pdf"
    ```

  - Possible validation error response (if both provided):

    ```json
    { "error": "You can either upload a file OR enter text for: lab_equipment_list" }
    ```

  - Success response:

    ```json
    { "success": true, "message": "Equipment information saved successfully." }
    ```

---

**Financial Info** (`src/routes/financialInfoRoute.ts`)

- **POST** `/api/finance` (authenticated, multipart)
  - Body fields: `endowment_fund`, `fund_balance`, `income_sources`, `annual_fee_income_estimate`, `annual_expenditure_estimate` (strings / numbers)
  - Optional file field: `financial_document`

  - JSON example (no file):

    ```json
    {
      "endowment_fund": "100000",
      "fund_balance": "50000",
      "income_sources": "Tuition, Grants",
      "annual_fee_income_estimate": "200000",
      "annual_expenditure_estimate": "150000"
    }
    ```

  - curl (with file):

    ```bash
    curl -X POST "http://localhost:5000/api/finance" \
      -H "Authorization: Bearer <accessToken>" \
      -F "endowment_fund=100000" \
      -F "financial_document=@/path/to/finance.pdf"
    ```

  - Success response:

    ```json
    { "success": true, "message": "Financial step updated successfully" }
    ```

---

**Building Info** (`src/routes/buildingInfoRoute.ts`)

- **POST** `/api/building` (authenticated, multipart)
  - Body fields: `owns_building` (string, e.g. "own" | "lease"), `class_rooms` (number), `properly_equipped` ("yes"|"no"), `electric_fitted` ("yes"|"no").
  - File fields: `building_plan_attached`, `lease_copy_attached` (each optional). If `owns_building` equals `lease`, `lease_copy_attached` is required (server validates this).

  - JSON example (no files):

    ```json
    {
      "owns_building": "own",
      "class_rooms": 6,
      "properly_equipped": "yes",
      "electric_fitted": "yes"
    }
    ```

  - curl (with files):

    ```bash
    curl -X POST "http://localhost:5000/api/building" \
      -H "Authorization: Bearer <accessToken>" \
      -F "owns_building=lease" \
      -F "class_rooms=4" \
      -F "lease_copy_attached=@/path/to/lease.pdf" \
      -F "building_plan_attached=@/path/to/plan.pdf"
    ```

  - Success response:

    ```json
    { "message": "Building information saved successfully." }
    ```

  - Validation error example (missing lease copy when required):

    ```json
    { "error": "Lease copy file is required when owns_building is 'lease'." }
    ```

---

**Owners Info** (`src/routes/ownersInfoRoute.ts`)

- File present but empty: `src/routes/ownersInfoRoute.ts` — no routes declared. Confirm if you want an owners route and what path/handler to use.

---

If you'd like I can also:

- Generate an OpenAPI (Swagger) JSON/YAML from these inferred schemas.
- Add TypeScript interfaces for request/response shapes and a sample Postman collection.

Tell me which of the above (OpenAPI, Postman, TS interfaces) you want next or if you want this file exported as a shareable spec.

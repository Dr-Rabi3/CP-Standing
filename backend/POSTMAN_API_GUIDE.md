# CP Standing API - Postman Collection Guide

## 📋 Overview

This Postman collection contains all API endpoints for the Competitive Programming Standing System. The collection is organized into folders for easy navigation.

## 🚀 Getting Started

### Import the Collection

1. Open Postman
2. Click **Import** button
3. Select the file: `CP-Standing-API.postman_collection.json`
4. The collection will be imported with all endpoints organized in folders

### Configure Environment Variables

1. Create a new environment in Postman (or use the default)
2. Add the following variable:
   - **Variable Name**: `base_url`
   - **Initial Value**: `http://localhost:5000` (for local development)
   - **Current Value**: `http://localhost:5000` (or your production URL)

## 📁 Collection Structure

### 1. Health Check
- **GET** `/api/health` - Check if server is running

### 2. Trainings
All endpoints for managing training sessions:

#### Basic CRUD
- **POST** `/api/trainings` - Create a new training
- **GET** `/api/trainings` - Get all trainings
- **GET** `/api/trainings/:id` - Get training by ID
- **GET** `/api/trainings/level/:level` - Get trainings by level (Beginner/Intermediate/Advanced)
- **PUT** `/api/trainings/:id` - Update training
- **DELETE** `/api/trainings/:id` - Delete training

#### Sheet Management
- **POST** `/api/trainings/:id/sheets` - Add sheet to training
- **GET** `/api/trainings/:id/sheets/:sheetId` - Get sheet in training
- **DELETE** `/api/trainings/:id/sheets/:sheetId` - Remove sheet from training

#### Contest Management
- **POST** `/api/trainings/:id/contests` - Add contest to training
- **GET** `/api/trainings/:id/contests/:contestId` - Get contest in training
- **DELETE** `/api/trainings/:id/contests/:contestId` - Remove contest from training

#### Trainee Management
- **POST** `/api/trainings/:id/trainees` - Add single trainee to training
- **POST** `/api/trainings/:id/trainees/bulk` - Add multiple trainees by IDs
- **POST** `/api/trainings/:id/trainees/by-handles` - Add trainees by Codeforces handles
- **POST** `/api/trainings/:id/trainees/by-coach` - Add all trainees from a coach
- **DELETE** `/api/trainings/:id/trainees/:traineeId` - Remove trainee from training

### 3. Trainees
All endpoints for managing trainees:

#### Basic CRUD
- **POST** `/api/trainees` - Create a new trainee
- **GET** `/api/trainees` - Get all trainees
- **GET** `/api/trainees/:id` - Get trainee by ID
- **GET** `/api/trainees/handle/:handle` - Get trainee by Codeforces handle
- **GET** `/api/trainees/coach/:coach` - Get trainees by coach
- **PUT** `/api/trainees/:id` - Update trainee
- **DELETE** `/api/trainees/:id` - Delete trainee

#### Performance Management
- **POST** `/api/trainees/:id/performances` - Add performance record
- **PUT** `/api/trainees/:id/performances/:performanceId` - Update performance record

#### Bulk Operations
- **POST** `/api/trainees/bulk-import` - Import multiple trainees from Codeforces handles
- **POST** `/api/trainees/bulk-sync` - Sync all trainees from Codeforces
- **POST** `/api/trainees/bulk-sync/coach/:coach` - Sync trainees by coach
- **POST** `/api/trainees/bulk-sync/training/:trainingId` - Sync trainees in a training

### 4. Contests
All endpoints for managing contests:

#### Basic CRUD
- **POST** `/api/contests` - Create a new contest
- **GET** `/api/contests` - Get all contests
- **GET** `/api/contests/:id` - Get contest by ID
- **PUT** `/api/contests/:id` - Update contest
- **DELETE** `/api/contests/:id` - Delete contest

#### Problem Management
- **POST** `/api/contests/:id/problems` - Add problem to contest
- **DELETE** `/api/contests/:id/problems/:problemId` - Remove problem from contest

#### Bulk Operations
- **POST** `/api/contests/bulk-import` - Import multiple contests from Codeforces
- **POST** `/api/contests/preview` - Preview contests before importing
- **POST** `/api/contests/import-single` - Import single contest
- **POST** `/api/contests/sync/:id` - Sync contest problems from Codeforces

### 5. Sheets
All endpoints for managing sheets:

#### Basic CRUD
- **POST** `/api/sheets` - Create a new sheet
- **GET** `/api/sheets` - Get all sheets
- **GET** `/api/sheets/:id` - Get sheet by ID
- **PUT** `/api/sheets/:id` - Update sheet
- **DELETE** `/api/sheets/:id` - Delete sheet

#### Problem Management
- **POST** `/api/sheets/:id/problems` - Add problem to sheet
- **DELETE** `/api/sheets/:id/problems/:problemId` - Remove problem from sheet

#### Bulk Operations
- **POST** `/api/sheets/bulk-import` - Import contests as sheets from Codeforces
- **POST** `/api/sheets/preview` - Preview contests before importing as sheets
- **POST** `/api/sheets/sync/:id` - Sync sheet problems from Codeforces

### 6. Standings
All endpoints for viewing and updating standings:

#### Training Standings
- **GET** `/api/standings/trainings/:trainingId/overall` - Get overall training standings
- **GET** `/api/standings/trainings/:trainingId/overall/filtered` - Get filtered overall standings (with query params: coach, minRating, maxRating)
- **GET** `/api/standings/trainings/:trainingId/summary` - Get training standings summary

#### Sheet/Contest Standings
- **GET** `/api/standings/trainings/:trainingId/sheets/:sheetId/standings` - Get sheet standings
- **GET** `/api/standings/trainings/:trainingId/contests/:contestId/standings` - Get contest standings

#### Sync & Update
- **POST** `/api/standings/trainees/:id/sync` - Sync trainee data from Codeforces
- **POST** `/api/standings/trainings/:trainingId/sheets/:sheetId/trainees/:traineeId/update` - Update individual sheet performance
- **POST** `/api/standings/trainings/:trainingId/contests/:contestId/trainees/:traineeId/update` - Update individual contest performance
- **POST** `/api/standings/trainings/:trainingId/sheets/:sheetId/bulk-update` - Bulk update all trainees for a sheet
- **POST** `/api/standings/trainings/:trainingId/contests/:contestId/bulk-update` - Bulk update all trainees for a contest

## 📝 Request Examples

### Create Training
```json
{
  "title": "Summer Training 2024",
  "level": "Intermediate",
  "type": "training",
  "startDate": "2024-06-01T00:00:00.000Z"
}
```

**Note**: `type` can be either `"training"` or `"camp"`. Camp type uses different penalty calculation.

### Create Trainee
```json
{
  "name": "John Doe",
  "handle": "johndoe",
  "titlePhoto": "https://example.com/photo.jpg",
  "coach": "Coach Name",
  "rating": 1500
}
```

### Create Contest
```json
{
  "title": "Weekly Contest 1",
  "duration": 120,
  "cfContestId": "1234",
  "problems": [
    {
      "name": "1234A",
      "alpha": "A"
    },
    {
      "name": "1234B",
      "alpha": "B"
    }
  ]
}
```

### Add Multiple Trainees to Training
```json
{
  "traineeIds": [
    "TRAINEE_ID_1",
    "TRAINEE_ID_2",
    "TRAINEE_ID_3"
  ]
}
```

### Add Trainees by Handles
```json
{
  "handles": [
    "handle1",
    "handle2",
    "handle3"
  ]
}
```

## 🔧 Tips

1. **Replace Placeholders**: All endpoints with `:id`, `:trainingId`, `:sheetId`, etc. have placeholder values. Replace them with actual IDs from your database.

2. **Check Responses**: Most endpoints return JSON with `success` and `data` fields. Check the response to see if the operation was successful.

3. **Error Handling**: If an endpoint returns an error, check the `error` field in the response for details.

4. **Environment Variables**: Update the `base_url` variable based on your environment:
   - Local: `http://localhost:5000`
   - Production: Your production URL

5. **Training Type**: Remember that `camp` type trainings use a different penalty calculation:
   - First wrong submission: no increase (0)
   - Second wrong: +2
   - Third wrong: +4
   - Fourth wrong: +8
   - And so on (each doubles)

## 📚 Response Format

Most endpoints follow this response format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🐛 Troubleshooting

1. **404 Not Found**: Check that the ID in the URL is correct
2. **400 Bad Request**: Check the request body format matches the examples
3. **500 Server Error**: Check server logs for detailed error messages
4. **CORS Issues**: Ensure your frontend URL is whitelisted in the server CORS configuration

## 📞 Support

For issues or questions, check the server logs or contact the development team.


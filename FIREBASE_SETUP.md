# Firebase Setup Instructions

Follow these steps to set up Firebase for shared message storage:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name (e.g., "molly-birthday")
   - Disable Google Analytics (optional, not needed for this)
   - Click "Create project"

## 2. Enable Firestore Database

1. In Firebase Console, go to **Build** > **Firestore Database**
2. Click "Create database"
3. Choose **"Start in test mode"** (for now, we'll add security rules later)
4. Select a location (choose closest to you)
5. Click "Enable"

## 3. Get Your Firebase Config

1. In Firebase Console, click the gear icon ⚙️ > **Project settings**
2. Scroll down to "Your apps" section
3. Click the **Web icon** `</>`
4. Register your app (nickname: "Molly Birthday Website")
5. **Copy the config object** - it looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

## 4. Update firebase-config.js

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config values
3. Save the file

## 5. Set Up Firestore Security Rules (Important!)

1. In Firebase Console, go to **Firestore Database** > **Rules**
2. Replace the rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /messages/{messageId} {
         // Allow anyone to read messages
         allow read: if true;
         // Allow anyone to create messages
         allow create: if request.resource.data.keys().hasAll(['name', 'message', 'timestamp']) &&
                       request.resource.data.name is string &&
                       request.resource.data.message is string &&
                       request.resource.data.name.size() > 0 &&
                       request.resource.data.message.size() > 0;
         // Prevent updates and deletes (optional - for security)
         allow update, delete: if false;
       }
     }
   }
   ```
3. Click "Publish"

## 6. Test It!

1. Open `board.html` in your browser
2. Try posting a test message
3. Refresh the page - your message should still be there
4. Open the page in a different browser/device - you should see all messages!

## Notes

- **Free Tier**: Firebase has a generous free tier that should be enough for a birthday website
- **Security**: The current rules allow anyone to post. If you want moderation, we can add authentication later
- **Image Storage**: Images are stored as base64 in Firestore. For many images, consider Firebase Storage instead

## Troubleshooting

- **"Firebase not configured" error**: Make sure you've updated `firebase-config.js` with your actual config
- **Messages not showing**: Check browser console (F12) for errors
- **Permission denied**: Make sure Firestore rules are published correctly


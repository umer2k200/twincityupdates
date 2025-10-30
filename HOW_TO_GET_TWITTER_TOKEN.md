# 🔑 How to Get Twitter API Bearer Token - Step by Step

## ✅ After Submitting the Developer Agreement

Follow these steps **exactly**:

---

### Step 1: Access Your Project Dashboard

1. After approval, you'll be redirected to your dashboard
2. Click on **"Projects & Apps"** in the left sidebar
3. You'll see your project listed
4. Click on **your project name**

---

### Step 2: Find Your App

1. You'll see an app listed under your project
2. Click on **your app name** (it will have a key icon 🔑)

---

### Step 3: Get Your Bearer Token

1. You'll see several tabs: **"App Settings"**, **"Keys and tokens"**, etc.
2. Click on **"Keys and tokens"** tab
3. Scroll down to the **"Bearer Token"** section
4. You'll see your Bearer Token (it starts with `AAAA` followed by a long string)
5. Click the **"Copy"** button or **"Regenerate"** button
6. **SAVE THIS TOKEN** - you won't see it again if you navigate away!

**Important:** The Bearer Token looks like:
```
AAAAetRRGLJ8...xyz123...verylongstring
```

---

### Step 4: If You Don't See Bearer Token

If you don't see a Bearer Token section, click **"Generate"** or **"Create"** button in the Bearer Token section.

---

## 📸 Visual Guide

Your screen should look like this:

```
┌──────────────────────────────────────────┐
│ Twitter Developer Portal                 │
│                                          │
│ Projects & Apps                          │
│    📁 Your Project                       │
│       🔑 Your App                        │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ App Settings | Keys and tokens | ... │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Keys and tokens                          │
│                                          │
│ Consumer Keys                            │
│   API Key: XXXXX                         │
│   API Key Secret: XXXXX                  │
│                                          │
│ Authentication Tokens                    │
│   Access Token: XXXXX                    │
│   Access Token Secret: XXXXX             │
│                                          │
│ Bearer Token                             │
│   ┌───────────────────────────────────┐ │
│   │ AAAAetRRGLJ8...xyz123...verylong  │ │
│   └───────────────────────────────────┘ │
│   [Copy] [Regenerate]                    │
└──────────────────────────────────────────┘
```

---

## 🎯 What to Do With the Bearer Token

Once you have it, set it as an EAS secret:

```bash
npx eas secret:create --scope project --name EXPO_PUBLIC_TWITTER_BEARER_TOKEN --value YOUR_BEARER_TOKEN_HERE --type string
```

Replace `YOUR_BEARER_TOKEN_HERE` with the actual token you copied.

---

## ⚠️ Important Notes

1. **Keep it secret** - Don't share your Bearer Token publicly
2. **Don't lose it** - Copy it immediately, you can't see it again without regenerating
3. **Free tier** - You get 1,500 tweets/month
4. **Rate limits** - Be mindful of limits

---

## 🆘 Still Can't Find It?

If you're having trouble:

1. Make sure you're logged in: https://developer.twitter.com/
2. Click on your **profile icon** (top right)
3. Go to **"Projects"** or **"Apps"**
4. Select your project and app
5. Look for **"Keys and tokens"** tab

---

## ✅ Next Steps After Getting Token

1. ✅ Copy your Bearer Token
2. ✅ Set it as EAS secret (command above)
3. ✅ Add Twitter usernames to code
4. ✅ Build new APK
5. ✅ Test in app!

---

**Need more help?** Let me know what screen you're seeing and I'll guide you! 🚀


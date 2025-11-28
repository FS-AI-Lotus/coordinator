# 🔧 הגדרת משתני סביבה לבדיקת /register בענן

## ✅ **משתנים מינימליים (חובה)**

לבדיקת `/register` endpoint, אתה צריך **רק 2 משתנים**:

```bash
PORT=8080              # Railway בדרך כלל מגדיר אוטומטית
NODE_ENV=production    # חשוב להגדיר ל-production
```

**זה הכל!** השירות יעבוד ב-**in-memory mode** - הנתונים יישמרו בזיכרון עד restart.

---

## 🗄️ **משתנים אופציונליים (מומלץ לפרודקשן)**

אם אתה רוצה שהנתונים יישמרו גם אחרי restart, הוסף Supabase:

```bash
# Supabase (לאחסון קבוע)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**איך להשיג:**
1. לך ל-[Supabase Dashboard](https://supabase.com/dashboard)
2. בחר פרויקט (או צור חדש)
3. לך ל-**Settings** → **API**
4. העתק את:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

---

## 📋 **הגדרה מינימלית ב-Railway (ללא Supabase)**

### שלב 1: לך ל-Railway Dashboard
1. פתח את הפרויקט שלך
2. בחר את השירות **coordinator**
3. לך ל-**Variables** (או **Environment**)

### שלב 2: הוסף משתנים
לחץ על **+ New Variable** והוסף:

| שם משתנה | ערך | הערה |
|-----------|-----|------|
| `NODE_ENV` | `production` | חובה |
| `PORT` | `8080` | Railway בדרך כלל מגדיר אוטומטית |

### שלב 3: שמור
Railway יבנה מחדש אוטומטית.

---

## 🧪 **איך לבדוק את /register אחרי Deployment**

### 1. מצא את ה-URL של השירות ב-Railway
- לך ל-**Settings** → **Networking**
- העתק את ה-URL (לדוגמה: `https://coordinator-production.up.railway.app`)

### 2. בדוק GET /register
```bash
curl https://coordinator-production.up.railway.app/register
```
**צפוי:** `200 OK` עם JSON response

### 3. בדוק POST /register
```bash
curl -X POST https://coordinator-production.up.railway.app/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rag",
    "url": "https://ragmicroservice.up.railway.app",
    "grpc": 50052
  }'
```
**צפוי:** `201 Created` עם `{"message": "Service registered", "serviceId": "..."}`

### 4. בדוק /health
```bash
curl https://coordinator-production.up.railway.app/health
```
**צפוי:** `200 OK` עם `{"status": "healthy", "registeredServices": 1, ...}`

---

## ⚠️ **הערות חשובות**

### ללא Supabase:
- ✅ השירות יעבוד
- ✅ `/register` יעבוד
- ⚠️ הנתונים יאבדו אחרי restart
- ⚠️ כל restart = מאגר ריק

### עם Supabase:
- ✅ השירות יעבוד
- ✅ `/register` יעבוד
- ✅ הנתונים יישמרו גם אחרי restart
- ✅ אפשר לשאול נתונים מ-Supabase Dashboard

---

## 🔍 **Troubleshooting**

### בעיה: השירות לא עולה
**פתרון:** בדוק ש-`NODE_ENV=production` מוגדר

### בעיה: `/register` מחזיר 500
**פתרון:** בדוק את ה-logs ב-Railway → **Deployments** → **View Logs**

### בעיה: הנתונים נעלמים אחרי restart
**פתרון:** הוסף Supabase (ראה למעלה)

### בעיה: לא יודע מה ה-URL של השירות
**פתרון:** 
1. Railway Dashboard → השירות שלך
2. **Settings** → **Networking**
3. העתק את ה-URL

---

## 📝 **דוגמה מלאה להגדרה ב-Railway**

### הגדרה מינימלית (ללא Supabase):
```
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
```

### הגדרה מומלצת (עם Supabase):
```
NODE_ENV=production
PORT=8080
LOG_LEVEL=info

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ **Checklist לפני בדיקה**

- [ ] `NODE_ENV=production` מוגדר ב-Railway
- [ ] השירות deployed בהצלחה
- [ ] יש לך את ה-URL של השירות
- [ ] (אופציונלי) Supabase מוגדר אם רוצים אחסון קבוע

---

## 🚀 **מוכן לבדוק!**

אחרי שהגדרת את המשתנים:
1. חכה ל-deployment להסתיים
2. קח את ה-URL של השירות
3. הרץ את הפקודות למעלה
4. בדוק שהכל עובד! 🎉


# 🔧 משתני סביבה ל-Railway

מדריך מלא למשתני הסביבה שצריך להגדיר ב-Railway עבור Coordinator Service.

---

## 📋 **משתנים חובה (Required)**

### **1. PORT**
- **תיאור**: פורט השרת HTTP
- **ערך ברירת מחדל**: `3000`
- **דוגמה**: `8080` (Railway בדרך כלל מגדיר את זה אוטומטית)
- **הערה**: Railway בדרך כלל מגדיר את זה אוטומטית, אבל אפשר להגדיר ידנית

### **2. NODE_ENV**
- **תיאור**: סביבת הרצה
- **ערך ברירת מחדל**: `development`
- **ערכים אפשריים**: `development` | `production`
- **דוגמה**: `production`
- **הערה**: חשוב להגדיר ל-`production` ב-Railway

---

## 🤖 **משתנים ל-AI Routing (אופציונלי אבל מומלץ)**

### **3. OPENAI_API_KEY**
- **תיאור**: מפתח API של OpenAI לשימוש ב-AI Routing
- **חובה**: כן (אם רוצים AI Routing)
- **דוגמה**: `sk-proj-abc123xyz789...`
- **איך להשיג**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **הערה**: אם לא מוגדר, המערכת תשתמש ב-fallback routing

### **4. AI_ROUTING_ENABLED**
- **תיאור**: הפעלת AI Routing
- **ערך ברירת מחדל**: `false`
- **ערכים אפשריים**: `true` | `false`
- **דוגמה**: `true`
- **הערה**: צריך להיות `true` כדי שהמערכת תשתמש ב-OpenAI

### **5. AI_MODEL**
- **תיאור**: מודל OpenAI לשימוש
- **ערך ברירת מחדל**: `gpt-4o-mini`
- **ערכים אפשריים**: `gpt-4o-mini` | `gpt-4` | `gpt-3.5-turbo` | וכו'
- **דוגמה**: `gpt-4o-mini`
- **הערה**: `gpt-4o-mini` הוא הכי זול ומהיר

### **6. AI_FALLBACK_ENABLED**
- **תיאור**: הפעלת fallback routing אם AI נכשל
- **ערך ברירת מחדל**: `true`
- **ערכים אפשריים**: `true` | `false`
- **דוגמה**: `true`
- **הערה**: מומלץ להשאיר `true` לאמינות

---

## 🗄️ **משתנים ל-Supabase (אופציונלי)**

### **7. SUPABASE_URL**
- **תיאור**: כתובת URL של פרויקט Supabase
- **חובה**: לא (אם לא מוגדר, משתמש ב-in-memory storage)
- **דוגמה**: `https://xxxxx.supabase.co`
- **הערה**: אם לא מוגדר, הנתונים יאבדו אחרי restart

### **8. SUPABASE_ANON_KEY**
- **תיאור**: מפתח anon/public של Supabase
- **חובה**: לא (אם לא מוגדר, משתמש ב-in-memory storage)
- **דוגמה**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **הערה**: זה המפתח הבטוח לשימוש ב-production

### **9. SUPABASE_SERVICE_ROLE_KEY** (אופציונלי)
- **תיאור**: מפתח service_role של Supabase (יותר חזק)
- **חובה**: לא
- **הערה**: ⚠️ **זהירות** - מפתח זה חזק מאוד, לא מומלץ ל-production אלא אם אתה יודע מה אתה עושה

---

## 🔌 **משתנים ל-gRPC (אופציונלי)**

### **10. GRPC_ENABLED**
- **תיאור**: הפעלת שרת gRPC
- **ערך ברירת מחדל**: `true`
- **ערכים אפשריים**: `true` | `false`
- **דוגמה**: `true`
- **הערה**: אם `false`, רק HTTP יעבוד

### **11. GRPC_PORT**
- **תיאור**: פורט שרת gRPC
- **ערך ברירת מחדל**: `50051`
- **דוגמה**: `50051`
- **הערה**: צריך להיות זמין אם `GRPC_ENABLED=true`

---

## 🔀 **משתנים ל-Routing (אופציונלי)**

### **12. DEFAULT_PROTOCOL**
- **תיאור**: פרוטוקול ברירת מחדל לתקשורת
- **ערך ברירת מחדל**: `http`
- **ערכים אפשריים**: `http` | `grpc`
- **דוגמה**: `http`

### **13. MAX_FALLBACK_ATTEMPTS**
- **תיאור**: מספר ניסיונות מקסימלי ב-cascading fallback
- **ערך ברירת מחדל**: `5`
- **דוגמה**: `5`

### **14. MIN_QUALITY_SCORE**
- **תיאור**: ציון איכות מינימלי לקבלת תגובה
- **ערך ברירת מחדל**: `0.5`
- **דוגמה**: `0.5`
- **טווח**: `0.0` - `1.0`

### **15. STOP_ON_FIRST_SUCCESS**
- **תיאור**: האם לעצור אחרי הצלחה ראשונה
- **ערך ברירת מחדל**: `true`
- **ערכים אפשריים**: `true` | `false`
- **דוגמה**: `true`

### **16. ATTEMPT_TIMEOUT**
- **תיאור**: timeout לכל ניסיון (במילישניות)
- **ערך ברירת מחדל**: `3000` (3 שניות)
- **דוגמה**: `3000`

---

## 📊 **משתנים ל-Logging (אופציונלי)**

### **17. LOG_LEVEL**
- **תיאור**: רמת לוגים
- **ערך ברירת מחדל**: `info`
- **ערכים אפשריים**: `error` | `warn` | `info` | `debug`
- **דוגמה**: `info`
- **הערה**: ב-production מומלץ `info` או `warn`

---

## 📝 **דוגמה להגדרה ב-Railway**

### **הגדרה מינימלית (ללא AI, ללא Supabase):**
```
PORT=8080
NODE_ENV=production
LOG_LEVEL=info
```

### **הגדרה מומלצת (עם AI Routing):**
```
PORT=8080
NODE_ENV=production
LOG_LEVEL=info

# AI Routing
OPENAI_API_KEY=sk-proj-xxxxx...
AI_ROUTING_ENABLED=true
AI_MODEL=gpt-4o-mini
AI_FALLBACK_ENABLED=true

# Supabase (אופציונלי)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# gRPC
GRPC_ENABLED=true
GRPC_PORT=50051
DEFAULT_PROTOCOL=http
```

### **הגדרה מלאה (עם כל האפשרויות):**
```
PORT=8080
NODE_ENV=production
LOG_LEVEL=info

# AI Routing
OPENAI_API_KEY=sk-proj-xxxxx...
AI_ROUTING_ENABLED=true
AI_MODEL=gpt-4o-mini
AI_FALLBACK_ENABLED=true

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# gRPC
GRPC_ENABLED=true
GRPC_PORT=50051
DEFAULT_PROTOCOL=http

# Routing Advanced
MAX_FALLBACK_ATTEMPTS=5
MIN_QUALITY_SCORE=0.5
STOP_ON_FIRST_SUCCESS=true
ATTEMPT_TIMEOUT=3000
```

---

## 🚀 **איך להגדיר ב-Railway**

1. לך ל-Railway Dashboard
2. בחר את הפרויקט שלך
3. בחר את השירות (Coordinator)
4. לך ל-**Variables** או **Environment**
5. לחץ על **+ New Variable**
6. הוסף כל משתנה עם השם והערך
7. שמור - Railway יבנה מחדש אוטומטית

---

## ✅ **Checklist לפני Deployment**

- [ ] `NODE_ENV=production` מוגדר
- [ ] `PORT` מוגדר (או Railway מגדיר אוטומטית)
- [ ] אם רוצים AI Routing: `OPENAI_API_KEY` ו-`AI_ROUTING_ENABLED=true` מוגדרים
- [ ] אם רוצים אחסון קבוע: `SUPABASE_URL` ו-`SUPABASE_ANON_KEY` מוגדרים
- [ ] `LOG_LEVEL` מוגדר ל-`info` או `warn` ב-production

---

## 📚 **קישורים שימושיים**

- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Railway Documentation](https://docs.railway.app)



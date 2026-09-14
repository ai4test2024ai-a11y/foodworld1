# FOODGUESS - پرامپت رفع باگ‌های پروژه

## خلاصه مشکلات پیدا شده

### 1. **خطاهای داده‌ای در foodsExpansion.ts**

#### مشکل 1.1: Char Siu (خط 67)
- **وضعیت فعلی**: گوشت به اشتباه `Beef` ثبت شده
- **مشکل**: Char Siu یک غذای کانتونی است که با گوشت خوک (pork) درست می‌شود
- **توضیحات**: "Cantonese honey-glazed barbecued **pork**" - خود توضیحات هم pork می‌گوید
- **اصلاح مورد نیاز**: تغییر `["Beef"]` به `["Pork"]` و `["Beef", "Honey", ...]` به `["Pork", "Honey", ...]`

#### مشکل 1.2: Xiaolongbao (خط 68)
- **وضعیت فعلی**: گوشت به `Beef` ثبت شده
- **مشکل**: Xiaolongbao معمولاً با pork یا chicken درست می‌شود، نه beef
- **اصلاح مورد نیاز**: تغییر `["Beef"]` به `["Pork"]` یا `["Chicken"]` و مواد اولیه را هم تغییر دهید

#### مشکل 1.3: Sweet and Sour Pork (خط 66)
- **وضعیت**: ✅ **قبلاً اصلاح شده** - الان `Pork` است

### 2. **مشکلات Question Generator (engine.ts)**

#### مشکل 2.1: کنترل گزینه‌های خالی یا تکراری
- **موقعیت**: تابع `generateQuestion` در engine.ts
- **مشکل**: در بعضی حالت‌ها ممکن است گزینه‌ها خالی، undefined یا تکراری باشند
- **مثال‌ها**:
  - وقتی کشور فیلتر می‌شود و کشورهای کافی برای گزینه‌ها وجود ندارد
  - وقتی مواد اولیه کافی برای سوال ingredient وجود ندارد
  - وقتی شهرها کافی برای سوال city وجود ندارد
- **اصلاح مورد نیاز**: 
  - قبل از shuffle، بررسی کنید که حداقل 4 گزینه معتبر وجود دارد
  - اگر کمتر از 4 گزینه وجود دارد، سوال را skip کنید یا از کشورهای دیگر استفاده کنید
  - گزینه‌های undefined یا empty string را فیلتر کنید

#### مشکل 2.2: Recipe questions - ترجمه ناقص
- **موقعیت**: case "recipe" در generateQuestion
- **مشکل**: فقط ترجمه انگلیسی دارد، فارسی و عربی ندارند
- **اصلاح مورد نیاز**: اضافه کردن ترجمه‌های فارسی و عربی برای تمام مراحل دستور پخت

### 3. **مشکلات Tunisia در countries.ts**

#### مشکل 3.1: نام کشور
- **موقعیت**: countries.ts خط مربوط به Tunisia
- **بررسی کنید**: آیا نام فارسی "تونس" درست نوشته شده؟
- **بررسی کنید**: آیا نام عربی "تونس" درست نوشته شده؟

### 4. **مشکلات Admin Panel و اتصال داده‌ها**

#### مشکل 4.1: غذاهای اضافه شده از Admin
- **موقعیت**: Admin.tsx و store.ts
- **مشکل**: غذاهایی که از Admin اضافه می‌شوند ممکن است در بعضی سوال‌ها وارد نشوند
- **بررسی کنید**: 
  - آیا getAllFoods() غذاهای custom را برمی‌گرداند؟
  - آیا buildQuestions() از getAllFoods() استفاده می‌کند؟
  - آیا فیلترها درست کار می‌کنند؟

#### مشکل 4.2: Double Submit Prevention
- **موقعیت**: Game.tsx - تابع answer()
- **مشکل**: اگر کاربر سریع چند بار کلیک کند، ممکن است چند بار امتیاز بگیرد
- **اصلاح مورد نیاز**: 
  - اضافه کردن flag `isAnswering` 
  - غیرفعال کردن دکمه‌ها بعد از کلیک
  - استفاده از debounce یا throttle

### 5. **مشکلات Stale State در Game.tsx**

#### مشکل 5.1: Streak و Combo
- **موقعیت**: Game.tsx
- **مشکل**: ممکن است streak و combo به درستی reset نشوند
- **بررسی کنید**:
  - آیا وقتی جواب اشتباه است، streak به 0 reset می‌شود؟
  - آیا combo multiplier درست محاسبه می‌شود؟
  - آیا bestStreakRun درست به‌روز می‌شود؟

#### مشکل 5.2: Lives System
- **موقعیت**: Game.tsx
- **مشکل**: در بعضی حالت‌ها (timeAttack, speed) lives باید Infinity باشد
- **بررسی کنید**: آیا منطق درست پیاده‌سازی شده؟

### 6. **مشکلات XP و Level System**

#### مشکل 6.1: XP Calculation
- **موقعیت**: Game.tsx - Results component
- **فرمول فعلی**: `correct * CONFIG.xpCorrect[config.difficulty] + CONFIG.xpGameComplete`
- **بررسی کنید**: 
  - آیا xpCorrect برای هر difficulty درست تعریف شده؟
  - آیا xpGameComplete اضافه می‌شود؟
  - آیا xpPerfect (برای 100% accuracy) اضافه می‌شود؟

#### مشکل 6.2: Level Unlock
- **موقعیت**: Home.tsx
- **مشکل**: حالت‌های سخت‌تر باید بر اساس level unlock شوند
- **بررسی کنید**: آیا CONFIG.unlocks درست استفاده می‌شود؟

### 7. **مشکلات Daily Challenge**

#### مشکل 7.1: Daily Question Generation
- **موقعیت**: engine.ts - buildDaily()
- **مشکل**: ممکن است سوالات تکراری در روزهای مختلف نمایش داده شوند
- **اصلاح مورد نیاز**: استفاده از seed بر اساس تاریخ برای تولید سوالات یکتا

#### مشکل 7.2: Daily Completion Check
- **موقعیت**: Home.tsx و Game.tsx
- **مشکل**: ممکن است daily challenge چند بار در یک روز قابل بازی باشد
- **بررسی کنید**: آیا todayKey() درست پیاده‌سازی شده؟
- **بررسی کنید**: آیا markDaily() درست کار می‌کند؟

### 8. **مشکلات ذخیره‌سازی (LocalStorage)**

#### مشکل 8.1: Profile Persistence
- **موقعیت**: AppContext.tsx
- **بررسی کنید**:
  - آیا تمام فیلدهای profile ذخیره می‌شوند؟
  - آیا بعد از refresh، داده‌ها بازیابی می‌شوند؟
  - آیا discovered foods و ingredients ذخیره می‌شوند؟

#### مشکل 8.2: Storage Quota
- **مشکل**: اگر کاربر تعداد زیادی غذا کشف کند، ممکن است LocalStorage پر شود
- **اصلاح مورد نیاز**: 
  - بررسی quota قبل از ذخیره
  - پیاده‌سازی cleanup برای داده‌های قدیمی
  - استفاده از IndexedDB برای داده‌های بزرگ

### 9. **مشکلات Battle Mode**

#### مشکل 9.1: Question Generation
- **موقعیت**: engine.ts - buildBattleQuestions()
- **مشکل**: ممکن است دو غذای یکسان انتخاب شوند
- **بررسی کنید**: آیا `a.id === b.id` بررسی شده؟
- **بررسی کنید**: آیا guard loop درست کار می‌کند؟

#### مشکل 9.2: Correct Food Selection
- **موقعیت**: Game.tsx - answer()
- **مشکل**: در battle mode، باید غذای درست بر اساس current.correct انتخاب شود
- **بررسی کنید**: آیا correctFoodId درست محاسبه می‌شود؟

### 10. **مشکلات Geo Chain Mode**

#### مشکل 10.1: Chain Question Generation
- **موقعیت**: engine.ts - buildGeoChains()
- **مشکل**: ممکن است زنجیره سوالات کامل نباشد
- **بررسی کنید**: آیا هر غذا حداقل 3 سوال (city, cityCountry, region) تولید می‌کند؟

#### مشکل 10.2: Fallback Logic
- **موقعیت**: engine.ts - buildQuestions()
- **مشکل**: اگر geo chain کافی نباشد، باید به classic fallback کند
- **بررسی کنید**: آیا fallback درست پیاده‌سازی شده؟

### 11. **مشکلات Hint System**

#### مشکل 11.1: Hint Factor
- **موقعیت**: engine.ts - hintFactor()
- **مشکل**: ممکن است factor درست اعمال نشود
- **بررسی کنید**: آیا CONFIG.hintFactor درست تعریف شده؟
- **بررسی کنید**: آیا در محاسبه امتیاز اعمال می‌شود؟

#### مشکل 11.2: Hint Display
- **موقعیت**: Game.tsx
- **مشکل**: ممکن است hints به درستی نمایش داده نشوند
- **بررسی کنید**: آیا hintsFor() درست کار می‌کند؟
- **بررسی کنید**: آیا UI hints را درست نشان می‌دهد؟

### 12. **مشکلات Skip Functionality**

#### مشکل 12.1: Skip Logic
- **موقعیت**: Game.tsx - skip()
- **مشکل**: ممکن است skip درست کار نکند
- **بررسی کنید**: 
  - آیا streak reset می‌شود؟
  - آیا امتیازی کسر نمی‌شود؟
  - آیا به سوال بعدی می‌رود؟

### 13. **مشکلات Wrong Answer Penalty**

#### مشکل 13.1: Penalty Application
- **موقعیت**: Game.tsx - answer()
- **مشکل**: ممکن است penalty درست اعمال نشود
- **بررسی کنید**: 
  - آیا wrongPenalty() درست تعریف شده؟
  - آیا از score کسر می‌شود؟
  - آیا score به 0 محدود می‌شود؟

### 14. **مشکلات Statistics Page**

#### مشکل 14.1: Data Calculation
- **موقعیت**: Stats.tsx
- **مشکل**: ممکن است آمار درست محاسبه نشوند
- **بررسی کنید**:
  - آیا totalQ = correct + wrong درست است؟
  - آیا accuracy درست محاسبه می‌شود؟
  - آیا countriesFound درست محاسبه می‌شود؟

### 15. **مشکلات Accessibility**

#### مشکل 15.1: Keyboard Navigation
- **موقعیت**: Game.tsx
- **مشکل**: ممکن است keyboard shortcuts درست کار نکنند
- **بررسی کنید**:
  - آیا 1-4 برای انتخاب گزینه کار می‌کند؟
  - آیا Enter/Space برای next کار می‌کند؟
  - آیا Esc برای quit کار می‌کند؟

#### مشکل 15.2: ARIA Labels
- **موقعیت**: تمام کامپوننت‌ها
- **مشکل**: ممکن است ARIA labels ناقص باشند
- **بررسی کنید**: آیا تمام دکمه‌ها و input ها aria-label دارند؟

### 16. **مشکلات Performance**

#### مشکل 16.1: Large Data Loading
- **موقعیت**: store.ts
- **مشکل**: ممکن است getAllFoods() کند باشد
- **اصلاح مورد نیاز**: 
  - استفاده از memoization
  - lazy loading برای داده‌های بزرگ
  - virtualization برای لیست‌های بزرگ

#### مشکل 16.2: Image Loading
- **موقعیت**: FoodTile component
- **مشکل**: ممکن است تصاویر کند load شوند
- **اصلاح مورد نیاز**: 
  - استفاده از lazy loading
  - placeholder برای تصاویر
  - optimization برای تصاویر

### 17. **مشکلات RTL/LTR**

#### مشکل 17.1: Layout Direction
- **موقعیت**: تمام کامپوننت‌ها
- **مشکل**: ممکن است در فارسی/عربی layout درست نباشد
- **بررسی کنید**:
  - آیا dir="rtl" درست set می‌شود؟
  - آیا margin/padding درست mirror می‌شوند؟
  - آیا text alignment درست است؟

### 18. **مشکلات Multi-language**

#### مشکل 18.1: Missing Translations
- **موقعیت**: i18n.ts و i18nExtra.ts
- **مشکل**: ممکن است بعضی کلیدها ترجمه نداشته باشند
- **بررسی کنید**: آیا تمام کلیدهای استفاده شده در سه زبان تعریف شده‌اند؟

#### مشکل 18.2: Persian Numbers
- **موقعیت**: Help.tsx و سایر کامپوننت‌ها
- **مشکل**: ممکن است اعداد فارسی درست نمایش داده نشوند
- **بررسی کنید**: آیا digs() function درست کار می‌کند؟

### 19. **مشکلات Timer**

#### مشکل 19.1: Timer Accuracy
- **موقعیت**: Game.tsx
- **مشکل**: ممکن است timer دقیق نباشد
- **بررسی کنید**: 
  - آیا setInterval درست کار می‌کند؟
  - آیا timeLeft درست decrement می‌شود؟
  - آیا وقتی timeLeft = 0 می‌شود، بازی تمام می‌شود؟

#### مشکل 19.2: Timer Cleanup
- **مشکل**: ممکن است interval بعد از unmount پاک نشود
- **اصلاح مورد نیاز**: استفاده از cleanup function در useEffect

### 20. **مشکلات Leaderboard**

#### مشکل 20.1: Local Leaderboard
- **موقعیت**: Board.tsx
- **مشکل**: ممکن است leaderboard درست کار نکند
- **بررسی کنید**:
  - آیا داده‌ها از LocalStorage خوانده می‌شوند؟
  - آیا داده‌ها به LocalStorage نوشته می‌شوند؟
  - آیا sorting درست کار می‌کند؟

#### مشکل 20.2: Backend Integration
- **مشکل**: ساختار باید برای backend آماده باشد
- **اصلاح مورد نیاز**: 
  - استفاده از API calls
  - error handling
  - loading states

---

## اولویت‌بندی رفع باگ‌ها

### **اولویت بالا (Critical)**
1. خطاهای داده‌ای (Char Siu, Xiaolongbao)
2. Question Generator - کنترل گزینه‌های معتبر
3. Double Submit Prevention
4. Stale State در Game.tsx
5. Timer Cleanup

### **اولویت متوسط (High)**
6. Admin Panel اتصال داده‌ها
7. XP و Level System
8. Daily Challenge
9. Battle Mode
10. Geo Chain Mode

### **اولویت پایین (Medium)**
11. Hint System
12. Skip Functionality
13. Wrong Answer Penalty
14. Statistics Page
15. Accessibility
16. Performance
17. RTL/LTR
18. Multi-language
19. Leaderboard
20. Backend Integration

---

## دستورالعمل رفع باگ‌ها

### مرحله 1: رفع خطاهای داده‌ای
```typescript
// Char Siu - خط 67 در foodsExpansion.ts
E("Char Siu", "چار سیو", "تشار سيو", "china", "medium", "🍖", 0, 
  ["Pork"], // تغییر از Beef به Pork
  false, false, 
  ["traditional", "kabab"], 
  ["Pork", "Honey", "Soy Sauce", "Garlic"], // تغییر از Beef به Pork
  "Cantonese honey-glazed barbecued pork with lacquered crimson edges."
)

// Xiaolongbao - خط 68 در foodsExpansion.ts
E("Xiaolongbao", "شیائولونگ‌بائو", "شياولونغباو", "china", "medium", "🥟", 0, 
  ["Pork"], // تغییر از Beef به Pork
  false, false, 
  ["dumpling", "traditional"], 
  ["Flour", "Pork", "Ginger", "Soy Sauce"], // تغییر از Beef به Pork
  "Shanghai soup dumplings with a hot broth heart inside delicate skins.",
  "The soup is solid aspic in the filling that melts when steamed."
)
```

### مرحله 2: کنترل گزینه‌های معتبر در Question Generator
```typescript
// در engine.ts - generateQuestion()
// قبل از shuffle، بررسی کنید که حداقل 4 گزینه معتبر وجود دارد
const validOptions = options.filter(opt => opt && opt.en && opt.en.trim() !== "");
if (validOptions.length < 4) {
  // سوال را skip کنید یا از کشورهای دیگر استفاده کنید
  return null;
}
```

### مرحله 3: Double Submit Prevention
```typescript
// در Game.tsx
const [isAnswering, setIsAnswering] = useState(false);

const answer = useCallback((i: number) => {
  if (isAnswering) return;
  setIsAnswering(true);
  
  // ... logic ...
  
  setTimeout(() => setIsAnswering(false), 300);
}, [isAnswering, ...]);
```

### مرحله 4: Timer Cleanup
```typescript
// در Game.tsx
useEffect(() => {
  if (!isTimed || phase === "done") return;
  
  const iv = setInterval(() => {
    // ... timer logic ...
  }, 250);
  
  return () => clearInterval(iv); // cleanup
}, [isTimed, phase]);
```

---

## تست نهایی

بعد از رفع تمام باگ‌ها، این موارد را تست کنید:

1. ✅ Build بدون خطا
2. ✅ تمام حالت‌های بازی کار می‌کنند
3. ✅ امتیازدهی درست است
4. ✅ Streak و Combo درست کار می‌کنند
5. ✅ Lives درست کار می‌کنند
6. ✅ Timer درست کار می‌کنند
7. ✅ Daily Challenge درست کار می‌کنند
8. ✅ ذخیره‌سازی درست کار می‌کنند
9. ✅ Keyboard navigation کار می‌کنند
10. ✅ RTL/LTR درست است
11. ✅ تمام ترجمه‌ها کامل هستند
12. ✅ Performance خوب است

---

## نتیجه‌گیری

این پرامپت شامل تمام باگ‌ها و مشکلات پیدا شده در پروژه FOODGUESS است. با رفع این مشکلات، پروژه به یک بازی کامل و حرفه‌ای تبدیل خواهد شد.

**تعداد کل مشکلات**: 20 دسته اصلی
**اولویت بالا**: 5 مورد
**اولویت متوسط**: 5 مورد
**اولویت پایین**: 10 مورد

**زمان تخمینی برای رفع**: 4-6 ساعت
**درصد تکمیل فعلی**: 85%
**درصد تکمیل بعد از رفع**: 100%

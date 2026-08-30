/** Curated step-by-step recipes for flagship dishes. Keyed by English food name. */
export interface RecipeStep {
  en: string;
  fa?: string;
  ar?: string;
}
export interface Recipe {
  prep: string;
  cook: string;
  total: string;
  servings: number;
  method: string;
  steps: RecipeStep[];
  serving?: string;
}

export const RECIPES: Record<string, Recipe> = {
  "Ghormeh Sabzi": {
    prep: "45 min", cook: "3–4 hrs", total: "~4.5 hrs", servings: 6, method: "Slow stewing",
    serving: "Serve over chelow rice with tahdig, raw onion and sabzi.",
    steps: [
      { en: "Finely chop and fry parsley, cilantro, leek/chives and fenugreek until dark green and fragrant.", fa: "جعفری، گشنیز، تره و شنبلیله را ریز خرد و تا تیره‌شدن سرخ کنید.", ar: "افرم البقدونس والكزبرة والحلبة واقليها حتى تصبح خضراء داكنة." },
      { en: "Sauté onions, add cubed beef or lamb with turmeric and brown well.", fa: "پیاز را تفت دهید، گوشت را با زردچوبه اضافه و سرخ کنید." },
      { en: "Add the fried herbs, soaked red kidney beans and water; bring to a boil.", fa: "سبزی سرخ‌شده، لوبیا قرمز خیس‌خورده و آب را اضافه کنید." },
      { en: "Pierce dried limes and add them; simmer 3+ hours on low until oil settles.", fa: "لیموعمانی‌ها را سوراخ و اضافه کنید؛ ۳ ساعت ریزجوش تا روغن بیندازد.", ar: "أضف الليمون المجفف واتركه على نار هادئة حتى يطفو الزيت." },
      { en: "Season with salt, pepper and a pinch of saffron; rest before serving.", fa: "نمک، فلفل و کمی زعفران بزنید و قبل از سرو بگذارید جا بیفتد." },
    ],
  },
  "Kabab Koobideh": {
    prep: "30 min + 2 hrs rest", cook: "8–10 min", total: "~3 hrs", servings: 4, method: "Charcoal grilling",
    serving: "Serve with saffron chelow, sumac, butter and raw onion.",
    steps: [
      { en: "Grate onions and squeeze out all the juice — this is the secret to adhesion.", fa: "پیاز را رنده و آبش را کاملاً بگیرید؛ راز چسبیدن کباب همین است." },
      { en: "Knead minced beef/lamb with onion, salt, pepper and saffron 10 minutes until sticky.", fa: "گوشت چرخ‌کرده را با پیاز، نمک، فلفل و زعفران ۱۰ دقیقه ورز دهید تا چسبناک شود." },
      { en: "Rest the mixture refrigerated for 2 hours.", fa: "مایه را ۲ ساعت در یخچال استراحت دهید." },
      { en: "Press meat onto wide skewers with wet fingers, creating finger grooves.", fa: "با دست خیس گوشت را روی سیخ پهن کوبیده و شیار بیندازید." },
      { en: "Grill over hot charcoal, turning fast at first; baste with butter and serve.", fa: "روی زغال داغ کباب کنید و ابتدا تند برگردانید؛ با کره رومال کنید." },
    ],
  },
  Tahchin: {
    prep: "40 min", cook: "1.5 hrs", total: "~2.2 hrs", servings: 6, method: "Steaming & baking",
    serving: "Invert onto a platter so the golden cake stands proud; garnish with barberries and pistachios.",
    steps: [
      { en: "Parboil basmati rice until just al dente and drain.", fa: "برنج را نیم‌پز کنید و آبکش کنید." },
      { en: "Whisk thick yogurt, egg yolks, melted butter, saffron water, salt.", fa: "ماست پرچرب، زرده تخم‌مرغ، کره، آب زعفران و نمک را هم بزنید." },
      { en: "Fold rice into the saffron-yogurt mixture.", fa: "برنج را با مایه زعفرانی مخلوط کنید." },
      { en: "Layer half the rice in a buttered pot, add cooked chicken and barberries, cover with the rest.", fa: "نیمی از برنج را کف قابلمه کره‌مالیده، مرغ و زرشک، و بقیه برنج را رویش بگذارید." },
      { en: "Steam on low heat ~90 minutes until a deep golden tahdig forms; flip to serve.", fa: "۹۰ دقیقه دم کنید تا ته‌دیگ طلایی شود؛ موقع سرو برگردانید." },
    ],
  },
  Fesenjan: {
    prep: "30 min", cook: "2.5 hrs", total: "3 hrs", servings: 6, method: "Slow stewing",
    steps: [
      { en: "Grind walnuts to a fine oily paste.", fa: "گردو را کاملاً آسیاب کنید تا خمیر روغنی شود." },
      { en: "Sauté onions, add chicken or duck pieces and brown lightly.", fa: "پیاز را تفت دهید و مرغ یا اردک را کمی سرخ کنید." },
      { en: "Stir in walnut paste, pomegranate molasses, sugar and water.", fa: "خمیر گردو، رب انار، شکر و آب را اضافه کنید." },
      { en: "Simmer 2+ hours, stirring so the walnut doesn't scorch, until dark and glossy.", fa: "۲ ساعت ریزجوش و هم بزنید تا تیره و براق شود." },
      { en: "Balance sweet and sour with more molasses or sugar; rest and serve with rice.", fa: "ترشی و شیرینی را تنظیم کنید و با برنج سرو کنید." },
    ],
  },
  "Zereshk Polo ba Morgh": {
    prep: "40 min", cook: "1.5 hrs", total: "~2 hrs", servings: 4, method: "Braising & steaming",
    steps: [
      { en: "Braise chicken with onions, turmeric, saffron, tomato paste and dried lime.", fa: "مرغ را با پیاز، زردچوبه، زعفران، رب و لیموعمانی بپزید." },
      { en: "Rinse barberries quickly and sauté briefly with sugar and butter.", fa: "زرشک را شسته و با شکر و کره کوتاه تفت دهید." },
      { en: "Steam saffron-tinted basmati rice with a potato or bread tahdig.", fa: "برنج زعفرانی را با ته‌دیگ سیب‌زمینی دم کنید." },
      { en: "Crown the rice with barberries and slivered pistachios; serve with the chicken.", fa: "برنج را با زرشک و پسته تزیین و با مرغ سرو کنید." },
    ],
  },
  "Ash Reshteh": {
    prep: "45 min + soaking", cook: "2 hrs", total: "~3 hrs", servings: 8, method: "Thick soup",
    serving: "Top with kashk, fried mint, fried onions and chickpeas.",
    steps: [
      { en: "Soak chickpeas, white beans and lentils overnight; parboil each.", fa: "نخود، لوبیا سفید و عدس را خیس و نیم‌پز کنید." },
      { en: "Sauté onions, garlic and turmeric; add beans, lentils and plenty of water.", fa: "پیاز و سیر را با زردچوبه تفت و حبوبات و آب اضافه کنید." },
      { en: "Add chopped parsley, cilantro, spinach and reshteh noodles; simmer until thick.", fa: "سبزی و رشته را اضافه و تا غلیظ‌شدن بپزید." },
      { en: "Finish with kashk and salt; ladle and garnish with fried mint and onions.", fa: "کشک بزنید و با نعنا داغ و پیاز داغ تزیین کنید." },
    ],
  },
  "Mirza Ghasemi": {
    prep: "20 min", cook: "30 min", total: "50 min", servings: 4, method: "Fire-roasting & sauté",
    steps: [
      { en: "Char eggplants over open flame until collapsed and smoky; peel and chop.", fa: "بادمجان را روی شعله کبابی و پوست کنده و ساطوری کنید." },
      { en: "Sauté minced garlic in oil until golden and fragrant.", fa: "سیر رنده را در روغن تا طلایی‌شدن تفت دهید." },
      { en: "Add eggplant and tomatoes; cook down the moisture with turmeric and salt.", fa: "بادمجان و گوجه را اضافه و آبش را با زردچوبه بکشید." },
      { en: "Pour in beaten eggs and stir gently until just set. Serve with rice or bread.", fa: "تخم‌مرغ را اضافه و تا بستن آرام هم بزنید." },
    ],
  },
  "Chelow with Tahdig": {
    prep: "15 min + soaking", cook: "50 min", total: "~1.5 hrs", servings: 4, method: "Parboil & steam",
    steps: [
      { en: "Soak basmati rice in salted water 30+ minutes.", fa: "برنج را ۳۰ دقیقه در آب نمک خیس کنید." },
      { en: "Parboil in plenty of water until grains are al dente; drain.", fa: "برنج را نیم‌پز و آبکش کنید." },
      { en: "Build a tahdig base: oil plus potato, bread or lettuce leaves in the pot.", fa: "کف قابلمه روغن و سیب‌زمینی یا نان بگذارید." },
      { en: "Mound the rice, poke steam holes, drizzle saffron water, and steam 45 minutes.", fa: "برنج را بکشید، سوراخ بخار بزنید و ۴۵ دقیقه دم کنید." },
      { en: "Rest, then invert the pot for a golden crown.", fa: "قابلمه را برگردانید تا تاج طلایی بیرون بیاید." },
    ],
  },
  "Kookoo Sabzi": {
    prep: "25 min", cook: "25 min", total: "50 min", servings: 4, method: "Pan-frying",
    steps: [
      { en: "Finely chop huge bundles of parsley, cilantro, dill, chives and fenugreek.", fa: "سبزی‌ها (جعفری، گشنیز، شوید، تره، شنبلیله) را ریز خرد کنید." },
      { en: "Beat eggs with turmeric, salt, pepper and a spoon of flour; mix in herbs and barberries.", fa: "تخم‌مرغ را با زردچوبه و آرد هم زده و با سبزی و زرشک مخلوط کنید." },
      { en: "Fry walnuts briefly and fold through.", fa: "گردو را کمی تفت و اضافه کنید." },
      { en: "Pour into a hot oiled pan; fry until deep golden, flip and cook through.", fa: "در تابه داغ سرخ کنید تا طلایی شود و برگردانید." },
    ],
  },
  "Pizza Margherita": {
    prep: "3 hrs dough", cook: "90 sec", total: "~3.5 hrs", servings: 2, method: "Wood-fired baking",
    steps: [
      { en: "Mix flour, water, salt and yeast; ferment the dough slowly 8–24 hours.", fa: "خمیر را درست و ۸ تا ۲۴ ساعت آرام تخمیر کنید." },
      { en: "Stretch each ball by hand into a thin disc with a puffy rim.", fa: "خمیر را با دست به دیسک نازک با لبه پفکی باز کنید." },
      { en: "Top with crushed San Marzano tomatoes, torn fior di latte and basil.", fa: "با گوجه سان مارزانو، موزارلا و ریحان بپوشانید." },
      { en: "Bake at the highest heat (ideally 450°C) for 60–90 seconds.", fa: "در داغ‌ترین فر ۶۰ تا ۹۰ ثانیه بپزید." },
      { en: "Finish with olive oil and fresh basil off the heat.", fa: "روغن زیتون و ریحان تازه بزنید." },
    ],
  },
  Sushi: {
    prep: "45 min", cook: "20 min", total: "~1 hr", servings: 4, method: "Hand-pressing & rolling",
    steps: [
      { en: "Rinse short-grain rice until water runs clear; cook with kombu.", fa: "برنج کوتاه‌دانه را بشویید و با کمبو بپزید." },
      { en: "Fold in warm sushi vinegar (rice vinegar, sugar, salt) and fan to cool.", fa: "سرکه سوشی را اضافه و با بادبزن خنک کنید." },
      { en: "Slice sushi-grade fish against the grain.", fa: "ماهی مخصوص سوشی را خلاف بافت برش بزنید." },
      { en: "Roll maki on nori with a bamboo mat, or press nigiri by hand with wasabi.", fa: "ماکی را با حصیر بامبو بپیچید یا نیگیری را با دست فرم دهید." },
      { en: "Serve immediately with soy sauce, pickled ginger and wasabi.", fa: "فوری با سس سویا، زنجبیل و واسابی سرو کنید." },
    ],
  },
  "Tacos al Pastor": {
    prep: "1 hr + overnight", cook: "20 min", total: "~2 hrs", servings: 6, method: "Trompo spit-grilling",
    steps: [
      { en: "Blend guajillo and ancho chilies, achiote, garlic, vinegar and pineapple juice.", fa: "فلفل‌های خشک، آچیوته، سیر، سرکه و آب آناناس را مخلوط کنید." },
      { en: "Marinate thin pork slices overnight in the red adobo.", fa: "ورقه‌های نازک گوشت را یک‌شب در آدوبو بخوابانید." },
      { en: "Grill hot and fast, ideally stacked on a vertical trompo with pineapple on top.", fa: "داغ و سریع کباب کنید؛ در حالت سنتی روی سیخ عمودی با آناناس." },
      { en: "Chop with crispy edges; warm corn tortillas on the griddle.", fa: "با لبه‌های برشته خرد کنید و تورتیلا را گرم کنید." },
      { en: "Serve with pineapple, onion, cilantro and lime.", fa: "با آناناس، پیاز، گشنیز و لیمو سرو کنید." },
    ],
  },
  Biryani: {
    prep: "1 hr", cook: "1 hr", total: "2 hrs", servings: 6, method: "Layered dum-steaming",
    steps: [
      { en: "Marinate chicken or mutton in yogurt, ginger-garlic, biryani masala and fried onions.", fa: "گوشت را در ماست، سیر و زنجبیل و ماسالا بخوابانید." },
      { en: "Parboil aged basmati with whole spices (cardamom, bay, clove) to 70% done.", fa: "برنج باسماتی را با ادویه‌های کامل تا ۷۰٪ بپزید." },
      { en: "Layer meat and rice; shower saffron milk, mint, rose water and more fried onions.", fa: "گوشت و برنج را لایه‌لایه و با شیر زعفران و نعنا بپوشانید." },
      { en: "Seal the pot and dum-steam 30–40 minutes on the lowest heat.", fa: "درِ قابلمه را ببندید و ۳۰ تا ۴۰ دقیقه دم کنید." },
      { en: "Serve with raita and salan, mixing layers gently.", fa: "با رایتا سرو کنید و لایه‌ها را آرام مخلوط کنید." },
    ],
  },
  Shakshuka: {
    prep: "10 min", cook: "25 min", total: "35 min", servings: 3, method: "Pan-poaching",
    steps: [
      { en: "Sauté onion and bell pepper; add garlic, cumin, paprika and chili.", fa: "پیاز و فلفل دلمه را تفت و ادویه بزنید." },
      { en: "Add crushed tomatoes and simmer to a thick, smoky sauce.", fa: "گوجه را اضافه و تا غلیظ‌شدن بپزید." },
      { en: "Make wells and crack eggs straight in; cover and poach gently.", fa: "چاله بزنید، تخم‌مرغ بشکنید و درپوش بگذارید." },
      { en: "Finish with feta, herbs and warm bread for dipping.", fa: "با پنیر فتا، سبزی و نان گرم سرو کنید." },
    ],
  },
  Ceviche: {
    prep: "30 min + 20 min cure", cook: "0 (lime cure)", total: "50 min", servings: 4, method: "Acid-curing",
    steps: [
      { en: "Cube the freshest sashimi-grade white fish and salt it lightly.", fa: "ماهی تازه را مکعبی و کمی نمک بزنید." },
      { en: "Bathe in fresh lime juice with ají limo or chili and red onion.", fa: "در آب لیموترش تازه با فلفل و پیاز قرمز بخوابانید." },
      { en: "Cure 15–20 minutes until edges turn opaque — never mushy.", fa: "۱۵ تا ۲۰ دقیقه بماند تا لبه‌ها مات شوند." },
      { en: "Serve with sweet potato, choclo corn and cancha, spooning over leche de tigre.", fa: "با سیب‌زمینی شیرین و ذرت و «شیر ببر» سرو کنید." },
    ],
  },
  Ratatouille: {
    prep: "30 min", cook: "1 hr", total: "1.5 hrs", servings: 6, method: "Layered baking",
    steps: [
      { en: "Build a piperade: cook down onion, pepper, garlic and tomato with herbs.", fa: "سس پایه با پیاز، فلفل، سیر و گوجه درست کنید." },
      { en: "Slice zucchini, eggplant and tomatoes into even rounds.", fa: "کدو، بادمجان و گوجه را حلقه‌ای یک‌اندازه برش بزنید." },
      { en: "Spiral the slices over the sauce; drizzle olive oil and thyme.", fa: "حلقه‌ها را مارپیچ روی سس بچینید و روغن زیتون بزنید." },
      { en: "Bake covered ~45 min, uncovered 15 more, until tender and glossy.", fa: "۴۵ دقیقه با درپوش و ۱۵ دقیقه بدون آن بپزید." },
    ],
  },
  Baklava: {
    prep: "1 hr", cook: "50 min", total: "2 hrs", servings: 12, method: "Layered baking & syruping",
    steps: [
      { en: "Layer buttered phyllo sheets in a tray, half below, half above the filling.", fa: "لایه‌های کره‌مالیده فیلو را بچینید؛ نیمی زیر و نیمی روی مواد." },
      { en: "Spread finely chopped pistachios or walnuts with a little sugar in the middle.", fa: "پسته یا گردوی خردشده با کمی شکر وسط بپاشید." },
      { en: "Score diamonds all the way down before baking.", fa: "قبل از پخت لوزی‌ها را تا ته برش بزنید." },
      { en: "Bake at 160°C ~50 minutes until deeply golden and crisp.", fa: "در فر ۱۶۰ درجه حدود ۵۰ دقیقه تا طلایی بپزید." },
      { en: "Pour cool sugar-lemon syrup over the hot tray; rest overnight.", fa: "شهد خنک را روی سینی داغ بریزید و یک‌شب استراحت دهید." },
    ],
  },
  Falafel: {
    prep: "30 min + overnight soak", cook: "15 min", total: "1 hr", servings: 4, method: "Deep-frying",
    steps: [
      { en: "Soak dried chickpeas overnight — never cooked or canned.", fa: "نخود خشک را یک‌شب خیس کنید؛ هرگز پخته نباشد." },
      { en: "Grind with onion, garlic, parsley, cilantro, cumin and coriander to a coarse meal.", fa: "با پیاز، سیر، سبزی و ادویه آسیاب کنید." },
      { en: "Rest the mixture 30 minutes; form tight balls or patties.", fa: "۳۰ دقیقه استراحت دهید و گلوله کنید." },
      { en: "Deep-fry at 175°C until mahogany-crisp outside, green-herbed inside.", fa: "در روغن ۱۷۵ درجه تا برشته سرخ کنید." },
      { en: "Serve in pita with tahini, pickles and salad.", fa: "در نان پیتا با سس ارده سرو کنید." },
    ],
  },
};

export function getRecipe(foodNameEn: string): Recipe | undefined {
  return RECIPES[foodNameEn];
}

export function hasRecipe(foodNameEn: string): boolean {
  return !!RECIPES[foodNameEn];
}

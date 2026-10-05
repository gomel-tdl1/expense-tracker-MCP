import { CATEGORY_LABELS, type Category } from './stats';

export const locales = ['ru', 'en', 'pl'] as const;
export type Locale = (typeof locales)[number];
export const intlLocale = { ru: 'ru-RU', en: 'en-GB', pl: 'pl-PL' } as const;
export function normalizeLocale(value?: string): Locale {
  return locales.includes(value as Locale) ? value as Locale : 'ru';
}

const ru = {
  categoryHint: 'Нажмите на категорию, чтобы увидеть позиции.', categoryPurchases: 'Позиции в категории', closeCategory: 'Закрыть', categoryTotal: 'Всего в категории',
  brand: 'расходы', overview: 'Обзор', purchases: 'Покупки', categories: 'Категории',
  personal: 'Личный обзор', title: 'Расходы в вашем ритме.', subtitle: 'Каждая покупка. В одном месте.',
  month: 'Месяц', show: 'Показать', signOut: 'Выйти', monthTotal: 'Расходы за месяц',
  priorMonth: 'Прошлый месяц', unchanged: 'Без изменений', compared: 'к прошлому месяцу',
  transactions: 'Покупок', average: 'Средняя покупка', largest: 'Самая большая покупка',
  dynamics: 'Ритм месяца', daily: 'Расходы по дням', structure: 'Структура', byCategory: 'По категориям',
  emptyChart: 'В этом месяце пока нет записей.', emptyCategories: 'Категории появятся после первой записи.',
  history: 'История', recent: 'Покупки за месяц', purchase: 'Покупка', items: 'поз.',
  emptyTitle: 'Первый чек — начало ритма.', emptyBody: 'Отправьте фото чека или список покупок в чат с подключённым MCP. Сохранённые позиции появятся здесь.',
  footer: 'Суммы в PLN · Даты по времени Варшавы', skip: 'Перейти к содержимому',
  language: 'Язык', light: 'Светлая тема', dark: 'Тёмная тема', motionOn: 'Включить анимации', motionOff: 'Выключить анимации',
  loginTitle: 'Войти в свой ритм.', loginDescription: 'Введите email и пароль, выданные администратором.',
  password: 'Пароль', signIn: 'Войти', signingIn: 'Входим…', loginError: 'Неверный email или пароль.', missingCredentials: 'Введите email и пароль.',
  loading: 'Загружаем расходы…', loadError: 'Не удалось загрузить расходы', retry: 'Повторить',
  invalidRequest: 'Неверный запрос доступа', missingRequest: 'Отсутствует идентификатор запроса.',
  consentTitle: 'Разрешить доступ к расходам?', requestsAccess: 'запрашивает доступ к вашей учётной записи.',
  scopes: 'Запрошенные права', unspecified: 'не указаны', approve: 'Разрешить', deny: 'Отклонить',
  privacy: 'Только данные покупок. Фотографии чеков не сохраняются.',
  summary: 'Итоги месяца', noPurchases: 'Пока нет покупок', chartHint: 'Выберите столбец, чтобы увидеть сумму',
};
type Messages = Record<keyof typeof ru, string>;
export const messages: Record<Locale, Messages> = {
  ru,
  en: {
    categoryHint: 'Select a category to see its items.', categoryPurchases: 'Items in category', closeCategory: 'Close', categoryTotal: 'Category total',
    brand: 'expenses', overview: 'Overview', purchases: 'Purchases', categories: 'Categories',
    personal: 'Personal overview', title: 'Spending. In your rhythm.', subtitle: 'Every purchase. All in one place.',
    month: 'Month', show: 'Show', signOut: 'Sign out', monthTotal: 'Monthly spending',
    priorMonth: 'Previous month', unchanged: 'No change', compared: 'vs previous month',
    transactions: 'Purchases', average: 'Average purchase', largest: 'Largest purchase',
    dynamics: 'Monthly rhythm', daily: 'Daily spending', structure: 'Breakdown', byCategory: 'By category',
    emptyChart: 'No purchases this month yet.', emptyCategories: 'Categories will appear after your first purchase.',
    history: 'History', recent: 'This month’s purchases', purchase: 'Purchase', items: 'items',
    emptyTitle: 'First receipt. First beat.', emptyBody: 'Send a receipt photo or shopping list in a chat with your MCP connected. Saved items will appear here.',
    footer: 'Amounts in PLN · Dates in Warsaw time', skip: 'Skip to content',
    language: 'Language', light: 'Light theme', dark: 'Dark theme', motionOn: 'Enable animations', motionOff: 'Disable animations',
    loginTitle: 'Find your rhythm.', loginDescription: 'Enter the email and password provided by your administrator.',
    password: 'Password', signIn: 'Sign in', signingIn: 'Signing in…', loginError: 'Incorrect email or password.', missingCredentials: 'Enter your email and password.',
    loading: 'Loading expenses…', loadError: 'Could not load expenses', retry: 'Try again',
    invalidRequest: 'Invalid access request', missingRequest: 'The request ID is missing.',
    consentTitle: 'Allow access to your expenses?', requestsAccess: 'is requesting access to your account.',
    scopes: 'Requested permissions', unspecified: 'not specified', approve: 'Allow', deny: 'Deny',
    privacy: 'Purchase data only. Receipt photos are not stored.',
    summary: 'Monthly summary', noPurchases: 'No purchases yet', chartHint: 'Select a bar to see the amount',
  },
  pl: {
    categoryHint: 'Wybierz kategorię, aby zobaczyć pozycje.', categoryPurchases: 'Pozycje w kategorii', closeCategory: 'Zamknij', categoryTotal: 'Suma w kategorii',
    brand: 'wydatki', overview: 'Przegląd', purchases: 'Zakupy', categories: 'Kategorie',
    personal: 'Twój przegląd', title: 'Wydatki w Twoim rytmie.', subtitle: 'Każdy zakup. W jednym miejscu.',
    month: 'Miesiąc', show: 'Pokaż', signOut: 'Wyloguj', monthTotal: 'Wydatki w miesiącu',
    priorMonth: 'Poprzedni miesiąc', unchanged: 'Bez zmian', compared: 'względem poprzedniego miesiąca',
    transactions: 'Zakupy', average: 'Średni zakup', largest: 'Największy zakup',
    dynamics: 'Rytm miesiąca', daily: 'Wydatki dzienne', structure: 'Struktura', byCategory: 'Według kategorii',
    emptyChart: 'Brak zakupów w tym miesiącu.', emptyCategories: 'Kategorie pojawią się po pierwszym zakupie.',
    history: 'Historia', recent: 'Zakupy w tym miesiącu', purchase: 'Zakup', items: 'poz.',
    emptyTitle: 'Pierwszy paragon. Pierwszy beat.', emptyBody: 'Wyślij zdjęcie paragonu lub listę zakupów w czacie z podłączonym MCP. Zapisane pozycje pojawią się tutaj.',
    footer: 'Kwoty w PLN · Daty według czasu Warszawy', skip: 'Przejdź do treści',
    language: 'Język', light: 'Jasny motyw', dark: 'Ciemny motyw', motionOn: 'Włącz animacje', motionOff: 'Wyłącz animacje',
    loginTitle: 'Zaloguj się do swojego rytmu.', loginDescription: 'Wpisz email i hasło otrzymane od administratora.',
    password: 'Hasło', signIn: 'Zaloguj się', signingIn: 'Logowanie…', loginError: 'Nieprawidłowy email lub hasło.', missingCredentials: 'Wpisz email i hasło.',
    loading: 'Ładowanie wydatków…', loadError: 'Nie udało się załadować wydatków', retry: 'Spróbuj ponownie',
    invalidRequest: 'Nieprawidłowe żądanie dostępu', missingRequest: 'Brak identyfikatora żądania.',
    consentTitle: 'Zezwolić na dostęp do wydatków?', requestsAccess: 'prosi o dostęp do Twojego konta.',
    scopes: 'Żądane uprawnienia', unspecified: 'nie określono', approve: 'Zezwól', deny: 'Odrzuć',
    privacy: 'Tylko dane zakupów. Zdjęcia paragonów nie są zapisywane.',
    summary: 'Podsumowanie miesiąca', noPurchases: 'Brak zakupów', chartHint: 'Wybierz słupek, aby zobaczyć kwotę',
  },
};
export const categoryTranslations: Record<Locale, Record<Category, string>> = {
  ru: CATEGORY_LABELS,
  en: {
    groceries: 'Groceries', dining: 'Dining out', cafes: 'Coffee shops', delivery: 'Food delivery', alcohol: 'Alcohol', tobacco: 'Tobacco & vaping',
    household: 'Household supplies', home: 'Home', furniture: 'Furniture & decor', appliances: 'Home appliances', electronics: 'Electronics',
    software: 'Software & apps', subscriptions: 'Subscriptions', rent: 'Rent', utilities: 'Utilities', internet: 'Internet & phone',
    transport: 'Transport', public_transport: 'Public transport', taxi: 'Taxi', fuel: 'Fuel', parking: 'Parking & tolls', car: 'Car & maintenance',
    travel: 'Travel', accommodation: 'Accommodation', health: 'Health', pharmacy: 'Pharmacy', beauty: 'Beauty & care', clothing: 'Clothing',
    shoes: 'Shoes', children: 'Children', pets: 'Pets', entertainment: 'Entertainment', sports: 'Sports', education: 'Education', books: 'Books & press',
    gifts: 'Gifts', charity: 'Charity', banking: 'Banking', taxes: 'Taxes & fees', services: 'Services', office: 'Stationery', other: 'Other',
  },
  pl: {
    groceries: 'Artykuły spożywcze', dining: 'Restauracje', cafes: 'Kawiarnie i kawa', delivery: 'Dostawa jedzenia', alcohol: 'Alkohol', tobacco: 'Tytoń i e-papierosy',
    household: 'Artykuły gospodarstwa domowego', home: 'Dom', furniture: 'Meble i dekoracje', appliances: 'AGD', electronics: 'Elektronika',
    software: 'Programy i aplikacje', subscriptions: 'Subskrypcje', rent: 'Czynsz najmu', utilities: 'Opłaty za media', internet: 'Internet i telefon',
    transport: 'Transport', public_transport: 'Komunikacja miejska', taxi: 'Taksówki', fuel: 'Paliwo', parking: 'Parking i opłaty drogowe', car: 'Samochód i serwis',
    travel: 'Podróże', accommodation: 'Noclegi', health: 'Zdrowie', pharmacy: 'Apteka', beauty: 'Uroda i pielęgnacja', clothing: 'Odzież',
    shoes: 'Obuwie', children: 'Dzieci', pets: 'Zwierzęta', entertainment: 'Rozrywka', sports: 'Sport', education: 'Edukacja', books: 'Książki i prasa',
    gifts: 'Prezenty', charity: 'Darowizny', banking: 'Usługi bankowe', taxes: 'Podatki i opłaty', services: 'Usługi', office: 'Artykuły papiernicze', other: 'Inne',
  },
};
export function categoryLabel(category: string, locale: Locale) {
  return Object.hasOwn(categoryTranslations[locale], category) ? categoryTranslations[locale][category as Category] : categoryTranslations[locale].other;
}
export function formatMoney(grosz: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale[locale], { style: 'currency', currency: 'PLN' }).format(grosz / 100);
}
export function formatDate(date: string, locale: Locale, monthOnly = false) {
  return new Intl.DateTimeFormat(intlLocale[locale], { ...(monthOnly ? { year: 'numeric' as const } : { day: 'numeric' as const }), month: 'long', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}

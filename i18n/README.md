# i18n Translation Setup

This project uses `i18next` and `react-i18next` for internationalization.

## Usage

### 1. Basic Translation in Components

```tsx
import { useTranslate } from '@/hooks/useTranslate';

function MyComponent() {
  const { t } = useTranslate();

  return (
    <View>
      <Text>{t('common.welcome')}</Text>
      <Text>{t('tabs.home')}</Text>
    </View>
  );
}
```

### 2. Using the useTranslation Hook Directly

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <View>
      <Text>{t('common.welcome')}</Text>
      <Text>Current Language: {i18n.language}</Text>
    </View>
  );
}
```

### 3. Interpolation

Add to your translation files:
```json
{
  "greeting": "Hello {{name}}!",
  "itemCount": "You have {{count}} items"
}
```

Use in components:
```tsx
<Text>{t('greeting', { name: 'John' })}</Text>
<Text>{t('itemCount', { count: 5 })}</Text>
```

### 4. Pluralization

In translation files:
```json
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}
```

Use in components:
```tsx
<Text>{t('items', { count: 1 })}</Text>  // "1 item"
<Text>{t('items', { count: 5 })}</Text>  // "5 items"
```

### 5. Change Language

```tsx
import { useTranslate } from '@/hooks/useTranslate';
import { saveLanguage } from '@/i18n/config';

function LanguageButton() {
  const { i18n } = useTranslate();

  const switchToThai = async () => {
    await i18n.changeLanguage('th');
    await saveLanguage('th'); // Save preference
  };

  return (
    <TouchableOpacity onPress={switchToThai}>
      <Text>Switch to Thai</Text>
    </TouchableOpacity>
  );
}
```

### 6. Using the Language Switcher Component

```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

function SettingsScreen() {
  return (
    <View>
      <Text>Choose Language:</Text>
      <LanguageSwitcher />
    </View>
  );
}
```

## Adding New Languages

1. Create a new JSON file in `i18n/locales/` (e.g., `fr.json`)
2. Add translations following the same structure as `en.json`
3. Import and register in `i18n/config.ts`:

```ts
import fr from './locales/fr.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    th: { translation: th },
    fr: { translation: fr }, // Add here
  },
  // ...
});
```

4. Add to the LanguageSwitcher component:

```ts
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' }, // Add here
];
```

## Translation File Structure

Organize translations by feature/section:

```json
{
  "common": {
    "welcome": "Welcome",
    "loading": "Loading..."
  },
  "tabs": {
    "home": "Home",
    "profile": "Profile"
  },
  "errors": {
    "networkError": "Network error"
  }
}
```

## Features

- ✅ Automatic language detection from device settings
- ✅ Language preference persistence (saved to AsyncStorage)
- ✅ Fallback to English if translation is missing
- ✅ Support for interpolation and pluralization
- ✅ TypeScript support
- ✅ Pre-configured with English and Thai

## Current Languages

- English (en) 🇬🇧
- Spanish (es) 🇪🇸
- French (fr) 🇫🇷

## Tips

1. **Keep keys consistent** across all language files
2. **Use nested objects** to organize translations by feature
3. **Test with different languages** to ensure UI layout works
4. **Add context in translation keys** (e.g., `button.save` vs `common.save`)
5. **Use defaultValue** for dynamic keys:
   ```tsx
   t('dynamic.key', { defaultValue: 'Fallback text' })
   ```

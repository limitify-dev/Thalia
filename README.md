# Thaia

<!-- Banner space - Add your banner image here -->
<p align="center">
  <!-- Your banner goes here -->
</p>

## About

Thaia is a mobile application built with React Native and Expo that helps users discover and explore galleries, exhibitions, and cultural sites. The app features an AI-powered assistant, interactive maps, personalized recommendations, and location-based services to enhance the cultural exploration experience.

## Features

- **AI Assistant**: Interactive AI bot powered by OpenAI for personalized recommendations and assistance
- **Interactive Maps**: Location-based discovery using Mapbox integration
- **Exhibitions & Galleries**: Browse and search through cultural sites, exhibitions, and galleries
- **Personalization**: Save favorites, track visit history, and get tailored recommendations
- **Multi-language Support**: i18n support with multiple language options
- **Dark Mode**: Automatic theme switching with light and dark mode support
- **Notifications**: Stay updated with exhibition schedules and nearby events
- **Voice Interaction**: Voice-enabled AI conversations using device microphone
- **Offline Support**: Redux Persist for local data storage and offline functionality

## Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) (v0.81.5)
- **Platform**: [Expo](https://expo.dev/) (SDK 54)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (v6)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) with Redux Persist
- **Maps**: [Mapbox Maps](https://github.com/rnmapbox/maps)
- **AI Integration**: [OpenAI API](https://openai.com/)
- **Internationalization**: [i18next](https://www.i18next.com/) & react-i18next
- **Animations**: [Lottie](https://github.com/lottie-react-native/lottie-react-native) & React Native Reanimated
- **Language**: TypeScript

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Xcode
- Android Studio (for Android development)
- Expo Go app (for testing on physical devices)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd thaia
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:

```env
# Add your API keys and configuration
OPENAI_API_KEY=your_openai_api_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token
# Add other required environment variables
```

## Running the App

### Development Mode

Start the development server:

```bash
npm start
```

### Run on iOS:

```bash
npm run ios
```

### Run on Android:

```bash
npm run android
```

### Run on Web:

```bash
npm run web
```

## Project Structure

```
thaia/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Home screen
│   │   ├── search.tsx       # Search screen
│   │   ├── map.tsx          # Map view
│   │   ├── ai-bot.tsx       # AI assistant
│   │   └── profile.tsx      # User profile
│   ├── DetailScreen.tsx     # Exhibition details
│   └── SettingsScreen.tsx   # App settings
├── Components-dui/          # Custom UI components
├── redux/                   # State management
│   ├── actions/            # Redux actions
│   ├── slices/             # Redux slices
│   └── store.js            # Redux store configuration
├── assets/                  # Images, icons, fonts, animations
├── components/              # Reusable components
├── constants/               # App constants and configuration
├── hooks/                   # Custom React hooks
├── i18n/                    # Internationalization files
│   └── locales/            # Translation files
├── utils/                   # Utility functions
└── axios/                   # API configuration
```

## Key Dependencies

- **UI & Styling**: React Native, Expo Linear Gradient, React Native SVG
- **Navigation**: Expo Router, React Native Screens
- **State Management**: Redux Toolkit, React Redux, Redux Persist
- **Maps**: @rnmapbox/maps
- **AI**: OpenAI SDK
- **Location**: Expo Location
- **Audio/Video**: Expo AV, Expo Speech
- **Animations**: Lottie React Native, React Native Reanimated
- **Internationalization**: i18next, react-i18next
- **Storage**: AsyncStorage
- **Network**: Axios, NetInfo

## Configuration

### iOS Configuration

The app requires specific iOS permissions configured in [app.json](app.json):

- Location access (NSLocationWhenInUseUsageDescription)
- Microphone access (NSMicrophoneUsageDescription)
- Background location (NSLocationAlwaysAndWhenInUseUsageDescription)

Minimum iOS deployment target: 15.1

### Android Configuration

Required Android permissions:

- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- RECORD_AUDIO
- INTERNET
- WRITE_EXTERNAL_STORAGE

## Features in Detail

### AI Assistant

The AI bot uses OpenAI's API to provide intelligent responses about exhibitions, galleries, and cultural recommendations. It supports both text and voice input.

### Map Integration

Interactive maps powered by Mapbox show nearby galleries and exhibitions based on user location, with real-time navigation and distance calculations.

### Multi-language Support

The app supports multiple languages including English, Spanish, French, and Chinese, with automatic locale detection.

### Theme Support

Automatic theme switching between light and dark modes based on system preferences, with manual override options.

## Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

For EAS Build:

```bash
eas build --platform ios
eas build --platform android
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software owned by Limitify.

## Contact

For questions or support, please contact the development team.

## Acknowledgments

- Expo team for the excellent development platform
- Mapbox for mapping services
- OpenAI for AI capabilities
- All open-source contributors whose libraries made this project possible

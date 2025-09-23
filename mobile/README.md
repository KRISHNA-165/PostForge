# Mobile App (Flutter + GetX)

This folder contains a lightweight scaffold for the Flutter app. If Flutter is installed, initialize the project and add dependencies:

1) Initialize Flutter project in-place
```
flutter create .
```

2) Add dependencies
```
flutter pub add get http shared_preferences flutter_widget_from_html
```

3) Create `lib/main.dart` using the provided example in this folder.

4) Run the app
```
flutter run
```

Environment:
- The app expects the API at `http://10.0.2.2:5000` (Android emulator) or `http://localhost:5000` (web/desktop). Adjust `ApiService.baseUrl` accordingly in `main.dart`.

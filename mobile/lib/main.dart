import 'package:flutter/material.dart';
import 'package:get/get.dart';

void main() {
  runApp(const BlogApp());
}

class ApiService {
  // Change to your API base. For Android emulator use http://10.0.2.2:5000
  static const String baseUrl = 'http://localhost:5000';
}

class BlogApp extends StatelessWidget {
  const BlogApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Event Blog',
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.indigo),
      initialRoute: '/',
      getPages: [
        GetPage(name: '/', page: () => const HomePage()),
        GetPage(name: '/login', page: () => const LoginPage()),
        GetPage(name: '/post', page: () => const PostDetailPage()),
        GetPage(name: '/create', page: () => const CreatePostPage()),
        GetPage(name: '/profile', page: () => const ProfilePage()),
      ],
    );
  }
}

class HomeController extends GetxController {
  final isLoading = false.obs;
  final posts = <Map<String, dynamic>>[].obs;
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});
  @override
  Widget build(BuildContext context) {
    final c = Get.put(HomeController());
    return Scaffold(
      appBar: AppBar(title: const Text('Feed')),
      body: Obx(() {
        if (c.isLoading.value) return const Center(child: CircularProgressIndicator());
        if (c.posts.isEmpty) return const Center(child: Text('No posts yet'));
        return ListView.builder(
          itemCount: c.posts.length,
          itemBuilder: (_, i) => ListTile(
            title: Text(c.posts[i]['title'] ?? ''),
            subtitle: Text(c.posts[i]['excerpt'] ?? ''),
            onTap: () => Get.toNamed('/post', arguments: c.posts[i]),
          ),
        );
      }),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Get.toNamed('/create'),
        child: const Icon(Icons.add),
      ),
    );
  }
}

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});
  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: Text('Login (wire to /api/auth/login)')));
  }
}

class PostDetailPage extends StatelessWidget {
  const PostDetailPage({super.key});
  @override
  Widget build(BuildContext context) {
    final post = Get.arguments as Map<String, dynamic>?;
    return Scaffold(
      appBar: AppBar(title: Text(post?['title'] ?? 'Post')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Text(post?['content'] ?? ''),
      ),
    );
  }
}

class CreatePostPage extends StatelessWidget {
  const CreatePostPage({super.key});
  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: Text('Create Post (wire to /api/posts)')));
  }
}

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});
  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: Text('Profile (wire to /api/profiles/:id)')));
  }
}

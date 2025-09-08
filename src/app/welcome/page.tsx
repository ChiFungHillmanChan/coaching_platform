import Link from 'next/link'
import { ArrowRight, BookOpen, Code, Sparkles, Users } from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to AI Coaching Platform! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Thank you for subscribing to my newsletter! I&apos;m Hillman, and I&apos;m excited to share 
            cutting-edge AI tools, web development tips, and learning resources with you.
          </p>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
            <Sparkles className="h-5 w-5" />
            You&apos;re now part of the community!
          </div>
        </div>

        {/* What You'll Get Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Tools & Tutorials</h3>
            <p className="text-gray-600 text-sm">Learn about the latest AI tools and how to use them effectively in your projects.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Web Development Tips</h3>
            <p className="text-gray-600 text-sm">Practical guides for modern web development, frameworks, and best practices.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Resources</h3>
            <p className="text-gray-600 text-sm">Curated content to help you grow your skills and advance your career.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">New Course Updates</h3>
            <p className="text-gray-600 text-sm">Be the first to know about new content, courses, and exclusive resources.</p>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">🚀 Getting Started</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-semibold">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Check Your Email</h3>
              <p className="text-gray-600 text-sm">You should receive a welcome email with your first set of resources.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-semibold">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">Explore Content</h3>
              <p className="text-gray-600 text-sm">Browse through our tutorials and guides to find what interests you most.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-semibold">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Stay Updated</h3>
              <p className="text-gray-600 text-sm">Watch for weekly newsletters with the latest tips, tools, and resources.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Learning?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our comprehensive guides and tutorials to accelerate your journey in AI and web development.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/en" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Explore Tutorials
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <Link 
              href="https://hillmanchan.com" 
              target="_blank"
              className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Visit My Website
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-4">
            Thank you for being part of our community! 🙏
          </p>
          <p className="text-gray-400 text-xs">
            Questions? Feel free to reach out to me directly.
          </p>
        </div>
      </div>
    </div>
  )
}
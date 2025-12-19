import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, ShoppingBag, Star, ChefHat, Smartphone } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
const HomePage = () => {
  const features = [{
    icon: Clock,
    title: 'Skip the Queue',
    description: 'Pre-order your meals and save precious time'
  }, {
    icon: Users,
    title: 'Multi-Role System',
    description: 'Customers, merchants, and admin management'
  }, {
    icon: ShoppingBag,
    title: 'Easy Ordering',
    description: 'Simple meal selection with customization options'
  }, {
    icon: Star,
    title: 'Quality Service',
    description: 'Real-time order tracking and updates'
  }];
  return <MainLayout>
    <Helmet>
      <title>QuickMeal - Skip the Queue, Pre-Order Your Meals</title>
      <meta name="description" content="Revolutionary meal pre-ordering platform that helps you skip queues and save time at your favorite restaurants." />
      <meta property="og:title" content="QuickMeal - Skip the Queue, Pre-Order Your Meals" />
      <meta property="og:description" content="Revolutionary meal pre-ordering platform that helps you skip queues and save time at your favorite restaurants." />
    </Helmet>

    {/* Hero Section */}
    <section className="relative min-h-screen flex items-center justify-center py-20 px-4 text-center text-white">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative max-w-7xl mx-auto">
        <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} className="floating-animation">
          <ChefHat className="w-20 h-20 mx-auto mb-8 text-orange-400" />
        </motion.div>

        <motion.h1 initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
          QuickMeal
        </motion.h1>

        <motion.p initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }} className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
          Skip the queue! Pre-order your favorite meals online and save time at your favorite restaurants.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/login">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              Get Started
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-20 px-4 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} viewport={{
          once: true
        }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Why Choose QuickMeal?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of food ordering with our innovative platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: index * 0.1
          }} viewport={{
            once: true
          }} whileHover={{
            scale: 1.05
          }}>
            <Card className="meal-card h-full hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                <CardTitle className="text-xl font-bold text-gray-800">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>)}
        </div>
      </div>
    </section>

    {/* How It Works Section */}
    <section className="py-20 px-4 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} viewport={{
          once: true
        }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple steps to get your meal ready when you arrive
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[{
            step: '1',
            title: 'Choose Your Store',
            description: 'Browse and select from registered restaurants',
            icon: '🏪'
          }, {
            step: '2',
            title: 'Customize Your Meal',
            description: 'Select meal type, curries, and add extras',
            icon: '🍛'
          }, {
            step: '3',
            title: 'Pick Up & Enjoy',
            description: 'Arrive at the store and collect your ready meal',
            icon: '✨'
          }].map((item, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: index * 0.2
          }} viewport={{
            once: true
          }} className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {item.step}
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">{item.title}</h3>
            <p className="text-gray-600 text-lg">{item.description}</p>
            <div className="text-4xl mt-4">{item.icon}</div>
          </motion.div>)}
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-20 px-4 bg-gradient-to-r from-orange-500 to-red-500">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} viewport={{
          once: true
        }}>
          <Smartphone className="w-16 h-16 mx-auto mb-6 text-white" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Skip the Queue?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who save time every day with QuickMeal
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-semibold">
              Start Ordering Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center mb-6">
          <ChefHat className="w-8 h-8 mr-2 text-orange-500" />
          <span className="text-2xl font-bold">QuickMeal</span>
        </div>
        <p className="text-gray-400 mb-4">
          Revolutionizing the way you order food. Save time, skip queues, enjoy meals.
        </p>
        <p className="text-gray-500 text-sm">
          © 2025 QuickMeal. All rights reserved.
        </p>
      </div>
    </footer>
  </MainLayout>;
};
export default HomePage;
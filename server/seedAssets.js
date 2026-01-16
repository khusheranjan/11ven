import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Asset from './models/Asset.js';

dotenv.config();

const sampleAssets = [
  {
    name: 'Heart',
    category: 'icons',
    tags: ['love', 'heart', 'romance', 'valentine'],
    imageUrl: '/assets/sample-designs/heart.svg',
    isPremium: false
  },
  {
    name: 'Star',
    category: 'icons',
    tags: ['star', 'favorite', 'rating', 'shine'],
    imageUrl: '/assets/sample-designs/star.svg',
    isPremium: false
  },
  {
    name: 'Smile',
    category: 'icons',
    tags: ['smile', 'happy', 'emoji', 'smiley'],
    imageUrl: '/assets/sample-designs/smile.svg',
    isPremium: false
  },
  {
    name: 'Avocado',
    category: 'characters',
    tags: ['avocado', 'vegan', 'food', 'healthy', 'cute'],
    imageUrl: '/assets/sample-designs/avocado.svg',
    isPremium: false
  },
  {
    name: 'Peace Sign',
    category: 'icons',
    tags: ['peace', 'hippie', 'symbol', 'love'],
    imageUrl: '/assets/sample-designs/peace.svg',
    isPremium: false
  },
  {
    name: 'Lightning Bolt',
    category: 'icons',
    tags: ['lightning', 'bolt', 'energy', 'power', 'thunder'],
    imageUrl: '/assets/sample-designs/lightning.svg',
    isPremium: false
  },
  {
    name: 'Planet',
    category: 'icons',
    tags: ['planet', 'space', 'astronomy', 'saturn'],
    imageUrl: '/assets/sample-designs/planet.svg',
    isPremium: false
  },
  {
    name: 'Flower',
    category: 'icons',
    tags: ['flower', 'nature', 'spring', 'floral'],
    imageUrl: '/assets/sample-designs/flower.svg',
    isPremium: false
  },
  {
    name: 'Rocket',
    category: 'icons',
    tags: ['rocket', 'space', 'launch', 'startup'],
    imageUrl: '/assets/sample-designs/rocket.svg',
    isPremium: false
  },
  {
    name: 'Coffee Cup',
    category: 'icons',
    tags: ['coffee', 'cafe', 'drink', 'caffeine'],
    imageUrl: '/assets/sample-designs/coffee.svg',
    isPremium: false
  },
  {
    name: 'VEGAN Text',
    category: 'quotes',
    tags: ['vegan', 'text', 'quote', 'healthy', 'green'],
    imageUrl: '/assets/sample-designs/vegan-text.svg',
    isPremium: false
  },
  {
    name: 'Hello Text',
    category: 'quotes',
    tags: ['hello', 'greeting', 'text', 'friendly'],
    imageUrl: '/assets/sample-designs/hello-text.svg',
    isPremium: false
  }
];

async function seedAssets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing sample assets
    await Asset.deleteMany({ imageUrl: { $regex: '/assets/sample-designs/' } });
    console.log('Cleared existing sample assets');

    // Insert new sample assets
    await Asset.insertMany(sampleAssets);
    console.log(`Successfully seeded ${sampleAssets.length} sample assets`);

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding assets:', error);
    process.exit(1);
  }
}

seedAssets();

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function checkMissingImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'dd_computer'
  });

  try {
    // Get all product images from database
    const [images] = await connection.execute('SELECT id, product_id, image_url FROM product_images');
    
    console.log(`Found ${images.length} product images in database`);
    
    const uploadsDir = path.join(__dirname, 'uploads');
    const missingImages = [];
    
    for (const image of images) {
      const filename = path.basename(image.image_url);
      const filePath = path.join(uploadsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        missingImages.push({
          id: image.id,
          product_id: image.product_id,
          image_url: image.image_url,
          filename: filename
        });
        console.log(`❌ Missing: ${filename} (Product ID: ${image.product_id})`);
      } else {
        console.log(`✅ Found: ${filename}`);
      }
    }
    
    if (missingImages.length > 0) {
      console.log('\n=== Missing Images Summary ===');
      console.log(`Total missing: ${missingImages.length}`);
      
      // Get list of available images in uploads directory
      const availableImages = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
      console.log(`Available images in uploads: ${availableImages.length}`);
      
      // Suggest fixes
      console.log('\n=== Suggested Fixes ===');
      for (const missing of missingImages) {
        console.log(`Product ID ${missing.product_id}: Update image_url to use an available image`);
      }
    } else {
      console.log('\n✅ All images exist in uploads directory');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkMissingImages();

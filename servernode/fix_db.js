const { sequelize } = require('./models');

async function fix() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // Get all tables
    const [tables] = await sequelize.query('SHOW TABLES');
    const dbName = sequelize.getDatabaseName();
    const tableNames = tables.map(t => t[`Tables_in_${dbName}`] || Object.values(t)[0]);
    
    console.log(`Checking ${tableNames.length} tables: ${tableNames.join(', ')}`);
    
    for (const tableName of tableNames) {
      console.log(`\n--- Processing table: ${tableName} ---`);
      const [indexes] = await sequelize.query(`SHOW INDEX FROM \`${tableName}\``);
      
      // Group indexes by column
      const columnIndexes = {};
      for (const idx of indexes) {
        if (idx.Key_name === 'PRIMARY') continue;
        const col = idx.Column_name;
        if (!columnIndexes[col]) columnIndexes[col] = [];
        columnIndexes[col].push(idx.Key_name);
      }
      
      for (const col in columnIndexes) {
        const idxNames = columnIndexes[col];
        if (idxNames.length > 1) {
          console.log(`Found ${idxNames.length} indexes on column "${col}": ${idxNames.join(', ')}`);
          
          // Drop all except the one that doesn't have a numeric suffix (if possible),
          // Or just leave exactly one.
          // MySQL starts hitting limits when there are many variations.
          for (let i = 1; i < idxNames.length; i++) {
            const idxToDrop = idxNames[i];
            console.log(`Dropping redundant index from ${tableName}: ${idxToDrop}...`);
            try {
              await sequelize.query(`ALTER TABLE \`${tableName}\` DROP INDEX \`${idxToDrop}\``);
              console.log(`Successfully dropped ${idxToDrop}`);
            } catch (e) {
              console.error(`Failed to drop ${idxToDrop}: ${e.message}`);
            }
          }
        }
      }
    }
    
    console.log('\nGlobal Database cleanup finished.');
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err.message);
    process.exit(1);
  }
}

fix();

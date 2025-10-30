#!/usr/bin/env node

/**
 * Database Migration Script: Add City Column
 * 
 * This script adds the city column to the users table
 */

import { sequelize } from './src/config/db.js';

async function addCityColumn() {
  try {
    console.log('🔄 Starting database migration: Add city column...');

    // Check if column already exists
    const tableDescription = await sequelize.getQueryInterface().describeTable('users');
    
    if (tableDescription.city) {
      console.log('✅ City column already exists. No migration needed.');
      return;
    }

    console.log('📋 Adding city column to users table...');

    // Add city column
    await sequelize.getQueryInterface().addColumn('users', 'city', {
      type: sequelize.Sequelize.STRING,
      allowNull: true
    });

    console.log('✅ Added city column to users table');

    console.log('🎉 Database migration completed successfully!');
    console.log('📊 Summary:');
    console.log('   - Added city column to users table');
    console.log('   - Column type: STRING, allowNull: true');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration
addCityColumn();

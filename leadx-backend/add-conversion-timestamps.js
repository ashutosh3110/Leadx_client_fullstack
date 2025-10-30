#!/usr/bin/env node

/**
 * Database Migration Script: Add Conversion Timestamps
 * 
 * This script adds timestamp columns for tracking conversion status changes:
 * - convertedAt: When user was marked as converted
 * - convertedBy: Who marked the user as converted
 * - enrolledAt: When user was marked as enrolled  
 * - enrolledBy: Who marked the user as enrolled
 */

import { sequelize } from './src/config/db.js';

async function addConversionTimestamps() {
  try {
    console.log('🔄 Starting database migration: Add conversion timestamps...');

    // Check if columns already exist
    const tableDescription = await sequelize.getQueryInterface().describeTable('users');
    
    const columnsToAdd = [];
    
    if (!tableDescription.convertedAt) {
      columnsToAdd.push({
        column: 'convertedAt',
        definition: {
          type: sequelize.Sequelize.DATE,
          allowNull: true
        }
      });
    }
    
    if (!tableDescription.convertedBy) {
      columnsToAdd.push({
        column: 'convertedBy',
        definition: {
          type: sequelize.Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        }
      });
    }
    
    if (!tableDescription.enrolledAt) {
      columnsToAdd.push({
        column: 'enrolledAt',
        definition: {
          type: sequelize.Sequelize.DATE,
          allowNull: true
        }
      });
    }
    
    if (!tableDescription.enrolledBy) {
      columnsToAdd.push({
        column: 'enrolledBy',
        definition: {
          type: sequelize.Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        }
      });
    }

    if (columnsToAdd.length === 0) {
      console.log('✅ All conversion timestamp columns already exist. No migration needed.');
      return;
    }

    console.log(`📋 Adding ${columnsToAdd.length} new columns to users table...`);

    // Add columns one by one
    for (const { column, definition } of columnsToAdd) {
      console.log(`🔧 Adding column: ${column}`);
      await sequelize.getQueryInterface().addColumn('users', column, definition);
      console.log(`✅ Added column: ${column}`);
    }

    console.log('🎉 Database migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Added ${columnsToAdd.length} new columns to users table`);
    console.log('   - convertedAt: Timestamp when user was marked as converted');
    console.log('   - convertedBy: ID of user who marked as converted');
    console.log('   - enrolledAt: Timestamp when user was marked as enrolled');
    console.log('   - enrolledBy: ID of user who marked as enrolled');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration
addConversionTimestamps();

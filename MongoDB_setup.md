# MongoDB Setup for Othello Dojo - Move History Storage

## Overview
This document outlines the MongoDB integration for storing Othello game move history, enabling comprehensive undo functionality and persistent game state management.

## Architecture Decisions

### 1. Database Design
- **Database Name**: `othello_dojo`
- **Collections**:
  - `games`: Stores complete game sessions with metadata
  - `moves`: Stores individual moves with references to games
  - `users`: Stores user preferences and statistics (future expansion)

### 2. Data Models

#### Game Document Structure
```typescript
interface Game {
  _id: ObjectId;
  gameId: string;           // Unique game identifier
  createdAt: Date;          // Game start timestamp
  updatedAt: Date;          // Last move timestamp
  gameMode: 'playerVsAi' | 'aiVsAi';
  difficulty: number;       // AI difficulty level
  ai1Difficulty?: number;   // For AI vs AI mode
  ai2Difficulty?: number;   // For AI vs AI mode
  userPlayer: 'black' | 'white' | null;
  currentPlayer: 'black' | 'white';
  gameState: 'playing' | 'gameOver';
  finalScore?: { black: number; white: number };
  winner?: 'black' | 'white' | 'draw';
  isActive: boolean;        // Whether game is still in progress
  totalMoves: number;       // Total moves made in the game
}
```

#### Move Document Structure
```typescript
interface Move {
  _id: ObjectId;
  gameId: string;           // Reference to game
  moveNumber: number;       // Sequential move number (1-based)
  player: 'black' | 'white';
  row: number;              // Board row (0-7)
  col: number;              // Board column (0-7)
  boardStateBefore: string; // Board state before move (compressed)
  boardStateAfter: string;  // Board state after move (compressed)
  tilesFlipped: Array<{row: number, col: number}>;
  timestamp: Date;
  isValidMove: boolean;     // Whether this was a valid move
}
```

### 3. Key Features

#### Enhanced Undo System
- **Unlimited Undo**: Users can undo all moves back to the start of the game
- **Move Validation**: Each move is validated and stored with context
- **State Reconstruction**: Any previous game state can be reconstructed from move history

#### Performance Optimizations
- **Board State Compression**: Board states are compressed using a custom encoding
- **Indexing**: Strategic indexes on gameId, moveNumber, and timestamps
- **Lazy Loading**: Move history is loaded on-demand for large games

#### Data Integrity
- **Atomic Operations**: Game state updates are atomic
- **Validation**: All moves are validated before storage
- **Consistency**: Board state consistency is maintained across all operations

## Implementation Plan

### Phase 1: Database Setup
1. Install MongoDB dependencies
2. Create database connection utilities
3. Implement data models and validation schemas
4. Set up indexes for optimal performance

### Phase 2: Core Integration
1. Replace localStorage with MongoDB for game persistence
2. Implement move history storage
3. Create game state reconstruction utilities
4. Add comprehensive undo functionality

### Phase 3: Advanced Features
1. Game session management
2. Move analysis and statistics
3. User preferences storage
4. Performance monitoring and optimization

## Environment Configuration

### Required Environment Variables
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/othello_dojo
MONGODB_DB_NAME=othello_dojo

# Optional: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/othello_dojo

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Database Indexes
```javascript
// Games collection indexes
db.games.createIndex({ "gameId": 1 }, { unique: true });
db.games.createIndex({ "createdAt": -1 });
db.games.createIndex({ "isActive": 1, "updatedAt": -1 });

// Moves collection indexes
db.moves.createIndex({ "gameId": 1, "moveNumber": 1 }, { unique: true });
db.moves.createIndex({ "gameId": 1, "timestamp": -1 });
db.moves.createIndex({ "player": 1, "timestamp": -1 });
```

## API Endpoints

### Game Management
- `POST /api/games` - Create new game
- `GET /api/games/:gameId` - Get game details
- `PUT /api/games/:gameId` - Update game state
- `DELETE /api/games/:gameId` - Delete game

### Move Management
- `POST /api/games/:gameId/moves` - Add new move
- `GET /api/games/:gameId/moves` - Get move history
- `GET /api/games/:gameId/moves/:moveNumber` - Get specific move
- `DELETE /api/games/:gameId/moves/:moveNumber` - Undo specific move

### Game State
- `GET /api/games/:gameId/state/:moveNumber` - Get board state at specific move
- `POST /api/games/:gameId/undo` - Undo last move(s)
- `POST /api/games/:gameId/undo-all` - Undo all moves to start

## Security Considerations

### Data Validation
- All input data is validated using Zod schemas
- Board state integrity is verified before storage
- Move validation ensures game rules compliance

### Access Control
- Game data is isolated by gameId
- No user authentication required for basic functionality
- Future expansion for user accounts and privacy

### Error Handling
- Comprehensive error handling for database operations
- Graceful fallback to localStorage if MongoDB unavailable
- Detailed logging for debugging and monitoring

## Migration Strategy

### From localStorage to MongoDB
1. **Hybrid Approach**: Initially support both localStorage and MongoDB
2. **Data Migration**: Provide utilities to migrate existing games
3. **Backward Compatibility**: Maintain localStorage as fallback
4. **Gradual Rollout**: Enable MongoDB features progressively

### Data Migration Utilities
```typescript
// Utility to migrate localStorage games to MongoDB
async function migrateGameFromLocalStorage(gameData: any): Promise<string> {
  // Implementation details
}

// Utility to export MongoDB games to localStorage
async function exportGameToLocalStorage(gameId: string): Promise<any> {
  // Implementation details
}
```

## Testing Strategy

### Unit Tests
- Database connection and utilities
- Data validation and transformation
- Move history reconstruction
- Undo functionality

### Integration Tests
- API endpoint functionality
- Game state persistence
- Move history management
- Error handling scenarios

### Performance Tests
- Large game move history handling
- Concurrent game operations
- Database query optimization
- Memory usage monitoring

## Monitoring and Maintenance

### Health Checks
- Database connection status
- API response times
- Error rate monitoring
- Data integrity verification

### Backup Strategy
- Regular database backups
- Game state snapshots
- Disaster recovery procedures
- Data retention policies

## Future Enhancements

### Analytics and Insights
- Game performance statistics
- Move pattern analysis
- AI performance tracking
- User behavior analytics

### Advanced Features
- Game sharing and replay
- Tournament management
- Social features
- Advanced AI analysis

## Conclusion

This MongoDB integration provides a robust foundation for persistent game state management and enhanced undo functionality. The modular design allows for future expansion while maintaining backward compatibility with the existing localStorage implementation.

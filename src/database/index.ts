import DatabaseConnection from './connection';
import { QueryService } from './queries';

const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  database: process.env.DATABASE_NAME || 'sapportlah',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
};

const dbConnection = new DatabaseConnection(dbConfig);
const queryService = new QueryService(dbConnection);

export { queryService, dbConnection };
export default queryService;

import DatabaseConnection from './connection';
import { QueryService } from './queries';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sapportlah',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

const dbConnection = new DatabaseConnection(dbConfig);
const queryService = new QueryService(dbConnection);

export { queryService, dbConnection };
export default queryService;

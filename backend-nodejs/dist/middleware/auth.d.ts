import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../utils/auth';
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireRole: (roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map
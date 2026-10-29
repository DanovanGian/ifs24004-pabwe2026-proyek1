import type { Request, Response, NextFunction } from 'express';
import { type AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  };

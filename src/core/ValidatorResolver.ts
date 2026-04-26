import { z } from 'zod';
import { IFieldConfig, IFieldValidation } from '../types';

type AnyZod = z.ZodTypeAny;

export class ValidatorResolver {
  public static buildSchema(fields: IFieldConfig[]) {
    const shape: Record<string, AnyZod> = {};

    fields.forEach((field) => {
      let validator = this.getBaseValidator(field);

      if (field.validation) {
        field.validation.forEach((rule) => {
          validator = this.applyRule(validator, rule);
        });
      }

      if (!field.validation?.some(v => v.rule === 'required')) {
        validator = validator.optional();
      }

      shape[field.id] = validator;
    });

    return z.object(shape).superRefine((data: Record<string, any>, ctx) => {
      fields.forEach((field) => {
        field.crossField?.forEach((rule) => {
          const valA = data[field.id];
          const valB = data[rule.targetId];

          if (valA == null || valB == null || valA === "" || valB === "" || !rule.operator) return;

          if (this.evaluateCondition(valA, valB, rule.operator)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: rule.message || `${field.label} must be ${rule.operator} ${rule.targetId}`,
              path: [field.id],
            });
          }
        });
      });
    });
  }

  private static getBaseValidator(field: IFieldConfig): AnyZod {
    const errMsg = { message: `${field.label} is invalid` };
    switch (field.type) {
      case 'number': return z.coerce.number(errMsg);
      case 'checkbox': return z.boolean(errMsg);
      case 'date': return z.coerce.date(errMsg);
      case 'email': return z.string().trim().email(`${field.label} must be valid`);
      default: return z.string().trim();
    }
  }

  private static applyRule(validator: AnyZod, rule: IFieldValidation): AnyZod {
    const msg = rule.message ? { message: rule.message } : undefined;
    const val = rule.value;
    switch (rule.rule) {
      case 'required':
        return (validator instanceof z.ZodString) ? validator.min(1, msg || "Required") : validator;
      case 'min':
        if (validator instanceof z.ZodNumber) return validator.min(Number(val), msg);
        return validator;
      case 'max':
        if (validator instanceof z.ZodNumber) return validator.max(Number(val), msg);
        return validator;
      default: return validator;
    }
  }

  private static evaluateCondition(a: any, b: any, op: string): boolean {
    const numA = Number(a), numB = Number(b);
    if (isNaN(numA) || isNaN(numB)) return false;
    switch (op) {
      case '>': return !(numA > numB);
      case '<': return !(numA < numB);
      case '>=': return !(numA >= numB);
      case '<=': return !(numA <= numB);
      case '==': return !(numA === numB);
      case '!=': return !(numA !== numB);
      default: return false;
    }
  }
}
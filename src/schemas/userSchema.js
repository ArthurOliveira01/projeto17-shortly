import Joi from "joi";

export const userSchema = Joi.object({
    name: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required(),
    confirmPassword: Joi.string().min(1).required()
})

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required(),
})
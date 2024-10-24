import React, { useEffect, useState } from 'react'; 
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../Tokens/authService';
import "../Estilos/Login.css";

const FormularioLogin = () => {
    const { register, formState: { errors }, handleSubmit, setError } = useForm();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false); 
    const [serverError, setServerError] = useState(""); // Para manejar errores de servidor

    useEffect(() => {
        document.body.setAttribute('id', 'login-body');
        return () => {
            document.body.removeAttribute('id');
        };
    }, []);

    const onSubmit = async (data) => {
        try {
            const result = await login(data.email, data.password);
            console.log("Inicio de sesión exitoso:", result);
            const isAdmin = result.isAdmin;
            if (isAdmin) {
                navigate("/admin/inicio");
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error("Error en la conexión:", error);
            if (error.response?.status === 402) {
                setError('email', { type: 'server', message: error.response.data.error });
            } else if (error.response?.status === 401) {
                setError('password', { type: 'server', message: error.response.data.error });
            } else {
                setServerError("Error inesperado. Por favor, intenta de nuevo más tarde.");
            }
        }
    };

    return (
        <div id="form-container">
            <form id="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <h2 id="login-title">Iniciar Sesión</h2>
                <div id="email-group">
                    <label htmlFor="email-input">Correo</label>
                    <input
                        id="email-input"
                        type="email"
                        {...register('email', {
                            required: "El campo correo es requerido",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@(alu\.uct\.cl|uct\.cl)$/,
                                message: 'El correo debe terminar en @alu.uct.cl o @uct.cl'
                            }
                        })}
                    />
                    {errors.email && <p id="email-error" className="error-message">{errors.email.message}</p>}
                    <i id="email-icon" className="input-icon"></i>
                </div>
                <div id="password-group">
                    <label htmlFor="password-input">Contraseña</label>
                    <div id="password-input-container">
                        <input
                            id="password-input"
                            type={showPassword ? 'text' : 'password'}
                            {...register('password', {
                                required: "El campo contraseña es requerido",
                                minLength: { value: 6, message: "Mínimo 6 caracteres" }
                            })}
                        />
                        <i
                            id="password-icon"
                            className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                            onClick={() => setShowPassword(!showPassword)}
                        ></i>
                    </div>
                    {errors.password && <p id="password-error" className="error-message">{errors.password.message}</p>}
                </div>
                <input id="submit-button" type="submit" value="Iniciar Sesión" />
                {serverError && <p className="error-message">{serverError}</p>}
                <p id="redirect-message" className="redirect-message">
                    ¿No tienes una cuenta? <Link to="/Register">Regístrate</Link>
                </p>
            </form>
        </div>
    );
};

export default FormularioLogin;

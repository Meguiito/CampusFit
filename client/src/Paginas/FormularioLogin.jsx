import React from 'react';
import { useForm } from "react-hook-form";
import { useNavigate, Link } from 'react-router-dom'; 
import { login } from '../Tokens/authService';
import "../Estilos/Login.css";

const FormularioLogin = () => {
    const { register, formState: { errors }, handleSubmit } = useForm();
    const navigate = useNavigate(); 

    const onSubmit = async (data) => {
        try {
            // Intentar hacer login con los datos proporcionados (correo y contraseña)
            const result = await login(data.correo, data.contraseña);
            console.log("Inicio de sesión exitoso:", result);
    
            // Si el login es exitoso, redirigir a la página principal
            navigate("/");
        } catch (error) {
            // Capturar y manejar cualquier error que ocurra en la autenticación
            console.error("Error en la conexión:", error);
    
            // Mostrar alerta solo si la autenticación falla
            alert("Usuario no registrado");
        }
    };
    

    return (
        <div className="form-container">
            <form id ="login-container" onSubmit={handleSubmit(onSubmit)}>
                <h2>Iniciar Sesión</h2>

                <div>
                    <label>Correo</label>
                    <input
                        type="email"
                        {...register('correo', {
                            required: "El campo correo es requerido",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                message: 'Formato de correo no válido'
                            }
                        })}
                    />
                    {errors.correo && <p className="error-message animated-error">{errors.correo.message}</p>}
                </div>

                <div>
                    <label>Contraseña</label>
                    <input
                        type="password"
                        {...register('contraseña', {
                            required: "El campo contraseña es requerido",
                            minLength: { value: 6, message: "Mínimo 6 caracteres" }
                        })}
                    />
                    {errors.contraseña && <p className="error-message animated-error">{errors.contraseña.message}</p>}
                </div>

                <input type="submit" value="Iniciar Sesión" />

                <p className="redirect-message">
                    ¿No tienes una cuenta? <Link to="/Register">Regístrate</Link>
                </p>
            </form>
        </div>
    );
}

export default FormularioLogin;

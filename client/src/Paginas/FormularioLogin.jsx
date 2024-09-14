import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom'; 
import "../Estilos/Login.css";


const FormularioLogin = () => {
    const [isRegistered, setIsRegistered] = useState(true); 
    const { register, formState: { errors }, handleSubmit, watch } = useForm();
    const navigate = useNavigate(); 

    const onSubmit = (data) => {
        if (isRegistered) {
            console.log("Inicio de sesión exitoso:", data);
        } else {
            console.log("Registro exitoso:", data);
        }
    }

 
    const handleRegisterClick = () => {
        setIsRegistered(false); 
        navigate("/Register");  
    };

    return (
        <div>
            <h2>{isRegistered ? "Iniciar Sesión" : "Registrarse"}</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
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

                {!isRegistered && (
                    <div>
                        <label>Repetir Contraseña</label>
                        <input
                            type="password"
                            {...register('repcontraseña', {
                                required: "El campo repetir contraseña es requerido",
                                validate: (value) => value === watch("contraseña") || "Las contraseñas no coinciden"
                            })}
                        />
                        {errors.repcontraseña && <p className="error-message animated-error">{errors.repcontraseña.message}</p>}
                    </div>
                )}

                <input type="submit" value={isRegistered ? "Iniciar Sesión" : "Registrarse"} />

                <p>
                    {isRegistered ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
                    <span
                        style={{ color: 'blue', cursor: 'pointer', marginLeft: '5px' }}
                        onClick={isRegistered ? handleRegisterClick : () => setIsRegistered(true)} 
                    >
                        {isRegistered ? "Regístrate" : "Inicia sesión"}
                    </span>
                </p>
            </form>
        </div>
    );
}

export default FormularioLogin;

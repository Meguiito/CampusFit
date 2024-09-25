import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate, Link } from 'react-router-dom'; 
import "../Estilos/Login.css";

const FormularioLogin = () => {
    const [isRegistered] = useState(true); 
    const { register, formState: { errors }, handleSubmit, watch } = useForm();
    const navigate = useNavigate(); 

    const onSubmit = async (data) => {
        try {
            let response;

            if (isRegistered) {
                response = await fetch('http://localhost:5000/users/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: data.correo,
                        password: data.contraseña
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log("Inicio de sesión exitoso:", result);

                    localStorage.setItem('token', result.token);

                    navigate("/");
                } else {
                    const errorData = await response.json();
                    console.error("Error en el inicio de sesión:", errorData);
                }
            } else {
                response = await fetch('http://localhost:5000/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: data.nombres + ' ' + data.apellidos,
                        rut: data.rut,
                        password: data.contraseña,
                        email: data.correo
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log("Registro exitoso:", result);
                    navigate("/Login");
                } else {
                    const errorData = await response.json();
                    console.error("Error en el registro:", errorData);
                }
            }
        } catch (error) {
            console.error("Error en la conexión:", error);
        }
    };

    return (
        <div className="form-container">
            <form id ="login-container"onSubmit={handleSubmit(onSubmit)}>
                <h2>{isRegistered ? "Iniciar Sesión" : "Registrarse"}</h2>
                {!isRegistered && (
                    <>
                        <div>
                            <label>Nombres</label>
                            <input
                                type="text"
                                {...register('nombres', {
                                    required: "El campo nombres es requerido",
                                    maxLength: { value: 30, message: "Máximo 30 caracteres" }
                                })}
                            />
                            {errors.nombres && <p className="error-message animated-error">{errors.nombres.message}</p>}
                        </div>

                        <div>
                            <label>Apellidos</label>
                            <input
                                type="text"
                                {...register('apellidos', {
                                    required: "El campo apellidos es requerido",
                                    maxLength: { value: 30, message: "Máximo 30 caracteres" }
                                })}
                            />
                            {errors.apellidos && <p className="error-message animated-error">{errors.apellidos.message}</p>}
                        </div>

                        <div>
                            <label>Rut</label>
                            <input
                                type="text"
                                {...register('rut', {
                                    required: "El campo RUT es requerido",
                                    maxLength: { value: 9, message: "Máximo 9 caracteres" }
                                })}
                            />
                            {errors.rut && <p className="error-message animated-error">{errors.rut.message}</p>}
                        </div>
                    </>
                )}

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

                <p className="redirect-message">
                    ¿No tienes una cuenta? <Link to="/Register">Regístrate</Link>
                </p>
            </form>
        </div>
    );
}

export default FormularioLogin;

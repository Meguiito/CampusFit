import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from 'react-router-dom';
import "../Estilos/Register.css";

const Formulario = () => {
    const { register, formState: { errors }, handleSubmit, watch, setError } = useForm();
    const navigate = useNavigate();
    const [mostrarContraseñas, setMostrarContraseñas] = useState({
        contraseña: false,
        repContraseña: false
    });
    
    const onSubmit = async (data) => {
        try {
            const response = await fetch('http://localhost:5000/users', {
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
                alert("Usuario registrado correctamente");
                navigate('/Login');
            } else {
                const errorData = await response.json();
                if (response.status === 401) {
                    setError('rut', { type: 'server', message: errorData.error });
                } else if (response.status === 402) {
                    setError('correo', { type: 'server', message: errorData.error });
                } else if (response.status === 403) {
                    setError('rut', { type: 'server', message: errorData.error_rut });
                    setError('correo', { type: 'server', message: errorData.error_email });
                } 
                else {
                    alert("Error inesperado. Por favor, intenta de nuevo más tarde.");
                }
            }
        
        } catch (error) {
            console.error("Error en la conexión:", error);
            alert("Error de conexión. Intenta de nuevo más tarde.");
        }
        
    }

    
    const contraseña = watch("contraseña");

    return (
        <div id="register-body">
            <form id="formulario-registro" onSubmit={handleSubmit(onSubmit)} noValidate>
                <h2 id="titulo-registro">Registro</h2>
                
                {/* Campo Nombres */}
                <div id="campo-nombres">
                    <label htmlFor="nombres">Nombres</label>
                    <input
                        id="input-nombres"
                        type="text"
                        {...register('nombres', {
                            required: "El campo nombres es requerido",
                            maxLength: { value: 30, message: "Máximo 30 caracteres" }
                        })}
                    />
                    {errors.nombres && <p id="error-nombres" className="error-message" data-error-id="nombres">{errors.nombres.message}</p>}
                </div>

                {/* Campo Apellidos */}
                <div id="campo-apellidos">
                    <label htmlFor="apellidos">Apellidos</label>
                    <input
                        id="input-apellidos"
                        type="text"
                        {...register('apellidos', {
                            required: "El campo apellidos es requerido",
                            maxLength: { value: 30, message: "Máximo 30 caracteres" }
                        })}
                    />
                    {errors.apellidos && <p id="error-apellidos" className="error-message" data-error-id="apellidos">{errors.apellidos.message}</p>}
                </div>

                {/* Campo RUT */}
                <div id="campo-rut">
                    <label htmlFor="rut">Rut</label>
                    <input
                        id="input-rut"
                        type="text"
                        {...register('rut', {
                            required: "El campo RUT es requerido",
                            pattern: {
                                value: /^[0-9]+-[0-9kK]{1}$/,
                                message: 'El formato del RUT es incorrecto. Ej: 12345678-9'
                            }
                        })}
                    />
                    {errors.rut && <p id="error-rut" className="error-message" data-error-id="rut">{errors.rut.message}</p>}
                </div>

                {/* Campo Correo */}
                <div id="campo-correo">
                    <label htmlFor="correo">Correo</label>
                    <input
                        id="input-correo"
                        type="text"
                        {...register('correo', {
                            required: "El campo correo es requerido",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@(alu\.uct\.cl|uct\.cl)$/,
                                message: 'El correo debe terminar en @alu.uct.cl o @uct.cl'
                            }
                        })}
                    />
                    {errors.correo && <p id="error-correo" className="error-message" data-error-id="correo">{errors.correo.message}</p>}
                </div>

                {/* Campo Contraseña */}
                <div id="campo-contraseña">
                    <label htmlFor="contraseña">Contraseña</label>
                    <div id="password-input-container">
                        <input
                            id="input-contraseña"
                            type={mostrarContraseñas.contraseña ? "text" : "password"}
                            {...register('contraseña', {
                                required: "El campo contraseña es requerido",
                                minLength: {
                                    value: 6,
                                    message: "La contraseña debe tener al menos 6 caracteres"
                                }
                            })}
                        />
                        <i 
                            id="password-icon" 
                            className={`fas ${mostrarContraseñas.contraseña ? 'fa-eye-slash' : 'fa-eye'}`}
                            onClick={() => setMostrarContraseñas(prev => ({ ...prev, contraseña: !prev.contraseña }))} 
                        />
                    </div>
                    {errors.contraseña && <p id="error-contraseña" className="error-message">{errors.contraseña.message}</p>}
                </div>

                <div id="campo-repcontraseña">
                    <label htmlFor="repcontraseña">Repetir Contraseña</label>
                    <div id="password-input-container">
                        <input
                            id="input-repcontraseña"
                            type={mostrarContraseñas.repContraseña ? "text" : "password"}
                            {...register('repcontraseña', {
                                required: "El campo repetir contraseña es requerido",
                                validate: value => value === contraseña || "Las contraseñas no coinciden"
                            })}
                        />
                        <i 
                            id="rep-password-icon" 
                            className={`fas ${mostrarContraseñas.repContraseña ? 'fa-eye-slash' : 'fa-eye'}`}
                            onClick={() => setMostrarContraseñas(prev => ({ ...prev, repContraseña: !prev.repContraseña }))} 
                        />
                    </div>
                    {errors.repcontraseña && <p id="error-repcontraseña" className="error-message">{errors.repcontraseña.message}</p>}
                </div>


                <input id="boton-registrarse" type="submit" value="Registrarse" /> 

                <p id="redirect-message">       
                    ¿Ya tienes una cuenta? <Link to="/Login">Inicia Sesión</Link>
                </p>
            </form>
        </div>
    );
}

export default Formulario;

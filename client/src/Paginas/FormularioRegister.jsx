import React from 'react';
import { useForm } from "react-hook-form";
import { Link } from 'react-router-dom'; // Importa Link para la redirección
import "../Estilos/Register.css";

const Formulario = () => {
    const { register, formState: { errors }, handleSubmit, watch } = useForm();

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
                const result = await response.json();
                console.log("Usuario registrado:", result);
            } else {
                const errorData = await response.json();
                console.error("Error:", errorData);
            }
        } catch (error) {
            console.error("Error en la conexión:", error);
        }
    };

    const contraseña = watch("contraseña");

    return (
        <div>
            <form id="register-container" onSubmit={handleSubmit(onSubmit)}>
                <h2>Registro</h2>
                <div>
                    <label htmlFor="nombres">Nombres</label>
                    <input
                        id="nombres"
                        type="text"
                        {...register('nombres', {
                            required: "El campo nombres es requerido",
                            maxLength: { value: 30, message: "Máximo 30 caracteres" }
                        })}
                    />
                    {errors.nombres && <p className="error-message animated-error">{errors.nombres.message}</p>}
                </div>

                <div>
                    <label htmlFor="apellidos">Apellidos</label>
                    <input
                        id="apellidos"
                        type="text"
                        {...register('apellidos', {
                            required: "El campo apellidos es requerido",
                            maxLength: { value: 30, message: "Máximo 30 caracteres" }
                        })}
                    />
                    {errors.apellidos && <p className="error-message animated-error">{errors.apellidos.message}</p>}
                </div>

                <div>
                    <label htmlFor="rut">Rut</label>
                    <input
                        id="rut"
                        type="text"
                        {...register('rut', {
                            required: "El campo RUT es requerido",
                            pattern: {
                                value: /^[0-9]+-[0-9kK]{1}$/, // RegEx para RUT sin puntos y con guion
                                message: 'El formato del RUT es incorrecto. Ej: 12345678-9'
                            }
                        })}
                    />
                    {errors.rut && <p className="error-message animated-error">{errors.rut.message}</p>}
                </div>

                <div>
                    <label htmlFor="correo">Correo</label>
                    <input
                        id="correo"
                        type="text"
                        {...register('correo', {
                            required: "El campo correo es requerido",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@alu\.uct\.cl$/,
                                message: 'El correo debe terminar en @alu.uct.cl'
                            }
                        })}
                    />
                    {errors.correo && <p className="error-message animated-error">{errors.correo.message}</p>}
                </div>

                <div>
                    <label htmlFor="contraseña">Contraseña</label>
                    <input
                        id="contraseña"
                        type="password"
                        {...register('contraseña', {
                            required: "El campo contraseña es requerido",
                        })}
                    />
                    {errors.contraseña && <p className="error-message animated-error">{errors.contraseña.message}</p>}
                </div>

                <div>
                    <label htmlFor="repcontraseña">Repetir Contraseña</label>
                    <input
                        id="repcontraseña"
                        type="password"
                        {...register('repcontraseña', {
                            required: "El campo repetir contraseña es requerido",
                            validate: value =>
                                value === contraseña || "Las contraseñas no coinciden"
                        })}
                    />
                    {errors.repcontraseña && <p className="error-message animated-error">{errors.repcontraseña.message}</p>}
                </div>

                <input type="submit" value="Registrarse" />

                <p className="redirect-message">       
                    ¿Ya tienes una cuenta? <Link to="/Login">Inicia Sesión</Link>
                </p>
            </form>
        </div>
    );
}

export default Formulario;

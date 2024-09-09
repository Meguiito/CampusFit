import React from 'react';
import { useForm } from "react-hook-form";
import "../Estilos/Register.css";


const Formulario = () => {

    const { register, formState: { errors }, handleSubmit, watch } = useForm();

    const onSubmit = (data) => {
        console.log(data);
    }

    // Observa el valor del campo "contraseña"
    const contraseña = watch("contraseña");

    return (
        <div>
            <h2>Formulario</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
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

                <div>
                    <label>Correo</label>
                    <input
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
                    <label>Contraseña</label>
                    <input
                        type="password"
                        {...register('contraseña', {
                            required: "El campo contraseña es requerido",
                        })}
                    />
                    {errors.contraseña && <p className="error-message animated-error">{errors.contraseña.message}</p>}
                </div>

                <div>
                    <label>Repetir Contraseña</label>
                    <input
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
            </form>
        </div>
    );
}

export default Formulario;

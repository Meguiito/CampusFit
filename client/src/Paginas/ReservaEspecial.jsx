import React, { useState } from "react";
import styled from "styled-components";

function ReservaEspecial() {
  const [formData, setFormData] = useState({
    archivo: null,
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.archivo) {
      if (formData.archivo.type !== "application/pdf") {
        setError("El archivo debe ser un PDF.");
        return;
      } else if (formData.archivo.size > 5000000) {
        setError("El archivo no debe exceder los 5MB.");
        return;
      } else {
        setError("");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("file", formData.archivo);

      try {
        const response = await fetch("http://localhost:5000/special_request", {
          method: "POST",
          body: formDataToSend,
        });

        if (response.ok) {
          const result = await response.json();
          alert("Formulario enviado con éxito: " + result.message);
        } else {
          const errorResponse = await response.json();
          setError(errorResponse.error);
        }
      } catch (err) {
        console.error("Error en la petición", err);
        setError("Ocurrió un error en la solicitud.");
      }
    } else {
      setError("Archivo es requerido.");
    }
  };

  const handleChange = (e) => {
    const { name, files } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : null,
    }));
    if (files && files[0]) {
      if (files[0].type !== "application/pdf") {
        setError("El archivo debe ser un PDF.");
      } else if (files[0].size > 5000000) {
        setError("El archivo no debe exceder los 5MB.");
      } else {
        setError("");
      }
    }
  };

  return (
    <FormularioContainer>
      <h2>Reserva Especial</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="archivo">Subir archivo (PDF):</label>
          <input
            type="file"
            id="archivo"
            name="archivo"
            accept=".pdf"
            onChange={handleChange}
          />
          {error && <Error>{error}</Error>}
        </div>
        <button type="submit">Enviar</button>
      </form>
    </FormularioContainer>
  );
}

export default ReservaEspecial;

const FormularioContainer = styled.div`
  background: linear-gradient(135deg, #3498DB, #ffffff);
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  margin: 20px;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;

  h2 {
    color: white;
    text-align: center;
    margin-bottom: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 50%;
    background-color: #2985ec;
    border-radius: 15px;
    padding: 20px;
    color: #FFD700;

    div {
      display: flex;
      flex-direction: column;

      label {
        margin-bottom: 5px;
        font-weight: bold;
      }

      input {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
    }

    button {
      padding: 10px;
      background-color: #FFD700;
      border: none;
      border-radius: 5px;
      color: black;
      cursor: pointer;
      font-size: 1rem;

      &:hover {
        color: white;
        background-color: #1e6bb8;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 15px;
    max-width: 90%;

    h2 {
      font-size: 1.25rem;
    }

    form {
      gap: 10px;

      div {
        input {
          font-size: 0.9rem;
        }
      }

      button {
        font-size: 0.9rem;
        background-color: #FFD700;
      }
    }
  }

  @media (max-width: 480px) {
    padding: 10px;

    h2 {
      font-size: 1rem;
    }

    form {
      gap: 5px;

      div {
        input {
          font-size: 0.8rem;
        }
      }

      button {
        font-size: 0.8rem;
      }
    }
  }
`;

const Error = styled.span`
  color: red;
  font-size: 0.875rem;
  margin-top: 5px;
`;

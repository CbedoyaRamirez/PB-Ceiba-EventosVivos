# 🚀 Quick Start — EventosVivos

Ejecuta el proyecto en **5 minutos**.

## Requisitos

```powershell
# Verificar instalación
dotnet --version    # >= 8.0.x
node --version      # >= 20.0.0
npm --version       # >= 11.0.0
```

## Paso 1: Backend

```powershell
# Terminal 1: Abre en Visual Studio o
cd EventosVivos.API
dotnet run

# ✅ Éxito: Backend en https://localhost:5001
# 📖 Swagger: https://localhost:5001/swagger
```

## Paso 2: Frontend

```powershell
# Terminal 2:
cd eventosvivos-app
npm install        # Solo primera vez
ng serve
# O: npm start

# ✅ Éxito: App en http://localhost:4200
```

## Paso 3: Tests (opcional)

```powershell
# Terminal 3:
dotnet test
# ✅ 46 tests pasando
```

## Casos de Uso

### 1. Crear Evento
- Abre http://localhost:4200
- Click "Nuevo evento"
- Rellena formulario
- Click "Guardar"

### 2. Hacer Reserva
- Ve a detalles de evento
- Click "Reservar ahora"
- Ingresa nombre, email, cantidad
- Click "Reservar"

### 3. Confirmar Pago
- Ve a "Reservas"
- Click "Confirmar pago"
- Código generado automáticamente

### 4. Explorar API
- Abre https://localhost:5001/swagger
- Prueba endpoints interactivamente

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Puerto en uso | `taskkill /PID <pid> /F` |
| CORS error | Asegurar backend corre |
| Module not found | `cd eventosvivos-app && npm install` |
| ng: not found | `npm install -g @angular/cli` |

---

Para documentación completa, ver **[README.md](README.md)**.

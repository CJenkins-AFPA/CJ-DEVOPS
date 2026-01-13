<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseButton from '../components/ui/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const loading = ref(false)
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Matrix Rain Logic
let intervalId: number
const initMatrixRain = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*'
  const fontSize = 14
  const columns = canvas.width / fontSize
  const drops: number[] = []

  for (let i = 0; i < columns; i++) {
    drops[i] = 1
  }

  const draw = () => {
    // Black with opacity for trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Green text with varied opacity for "Rain" effect
    ctx.fillStyle = `rgba(0, 255, 0, ${Math.random() * 0.4 + 0.2})` // 0.2 to 0.6 opacity
    ctx.font = `${fontSize}px monospace`

    for (let i = 0; i < drops.length; i++) {
      const text = characters.charAt(Math.floor(Math.random() * characters.length))
      
      const x = i * fontSize
      const y = (drops[i] ?? 0) * fontSize
      ctx.fillText(text, x, y)

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0
      }
      if (drops[i] !== undefined) drops[i]!++
    }
  }
  
  intervalId = window.setInterval(draw, 33)
}

const handleResize = () => {
   if(canvasRef.value) {
     canvasRef.value.width = window.innerWidth
     canvasRef.value.height = window.innerHeight
   }
}

onMounted(() => {
  initMatrixRain()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  clearInterval(intervalId)
  window.removeEventListener('resize', handleResize)
})

const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(username.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = 'Invalid username or password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="background-globes">
      <div class="globe globe-1"></div>
      <div class="globe globe-2"></div>
    </div>
    
    <canvas ref="canvasRef" class="matrix-canvas"></canvas>
    
    <div class="login-content animate-enter">
      <div class="brand-container">
        <div class="brand-top">
          <img src="/logo-new.png" alt="uyoop logo" class="brand-logo" />
          <div class="brand-text">
            <h1 class="brand-title font-comfortaa">uHub</h1>
            <p class="subtitle font-comfortaa">by uyoop</p>
          </div>
        </div>
        <p class="tagline font-comfortaa">DevSecAiOps Toolkit</p>
      </div>

      <div class="card-wrapper">
        <BaseCard class="login-card">
          <h2 class="font-comfortaa">Welcome Back</h2>
          <p class="hint">Enter your credentials to access the workspace.</p>

          <form @submit.prevent="handleLogin" class="login-form">
            <!-- Custom Error Alert -->
            <div v-if="error" class="error-alert">
              <span class="error-icon">⚠️</span>
              {{ error }}
            </div>

            <BaseInput 
              id="username"
              v-model="username"
              label="Username"
              placeholder="demo-admin"
            />
            
            <BaseInput 
              id="password"
              v-model="password"
              label="Password"
              type="password"
              placeholder="demo-admin"
            />

            <BaseButton 
              variant="primary" 
              :loading="loading" 
              class="full-width font-comfortaa sign-in-btn"
              type="submit"
            >
              Sign In
            </BaseButton>
          </form>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  background: black;
}

.matrix-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2; /* Rain in front of globes, behind card */
  mix-blend-mode: screen; /* Blend nicely */
}

/* Moving Green Blobs */
.background-globes {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.globe {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: moveBlob 20s infinite ease-in-out alternate;
}

.globe-1 {
  width: 500px;
  height: 500px;
  background: #004d00; /* Dark Green */
  top: -100px;
  left: -100px;
}

.globe-2 {
  width: 400px;
  height: 400px;
  background: #003300; /* Very Dark Green */
  bottom: -50px;
  right: -50px;
  animation-delay: -5s;
}

@keyframes moveBlob {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(50px, 50px) scale(1.1); }
  100% { transform: translate(-30px, 20px) scale(0.9); }
}

.login-content {
  z-index: 10;
  width: 100%;
  max-width: 420px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Reduced gap */
}

/* Brand Layout */
.brand-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.5rem;
}

.brand-top {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.brand-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.brand-logo {
  max-width: 64px; /* Reduced Size */
  height: auto;
  filter: drop-shadow(0 0 10px rgba(0, 255, 0, 0.4));
}

.brand-title {
  font-size: 2.5rem;
  color: var(--c-primary);
  margin: 0;
  line-height: 1;
  text-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
}

.subtitle {
  color: var(--c-text-muted);
  font-size: 1rem;
  margin: 0;
}

.tagline {
  color: var(--c-primary);
  opacity: 0.9;
  font-size: 0.9rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 700;
  margin-top: 5px;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

/* Responsive */
@media (max-width: 480px) {
  .brand-top {
    flex-direction: column;
    text-align: center;
  }
  .brand-text {
    align-items: center;
  }
}

/* Animated Border Wrapper */
.card-wrapper {
  position: relative;
  border-radius: var(--radius-lg);
  padding: 2px;
  background: linear-gradient(90deg, #00ff00, #000000, #004d00, #000000, #00ff00);
  background-size: 400% 400%;
  animation: metallicFlow 8s ease infinite;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.15);
}

@keyframes metallicFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.login-card {
  height: 100%;
  backdrop-filter: blur(20px);
  background: rgba(0, 0, 0, 0.9); /* More opaque for contrast */
  border: none;
  border-radius: var(--radius-lg);
  padding: 2rem; /* Ensure standard padding */
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
}

.hint {
  color: var(--c-text-muted);
  margin-bottom: 1.5rem; /* Reduced */
  font-size: 0.9rem;
}

.sign-in-btn {
  color: black !important;
  font-weight: 800;
}

.full-width {
  width: 100%;
  margin-top: 0.5rem;
}

.error-alert {
  background: rgba(255, 0, 0, 0.15);
  border: 1px solid #ff0000;
  color: #ffcccc;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  animation: shake 0.4s ease-in-out;
}

.error-icon {
  font-size: 1.1rem;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
</style>

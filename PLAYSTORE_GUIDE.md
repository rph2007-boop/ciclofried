# Guia para Publicação do CicloFriend na Google Play Store

O seu aplicativo **CicloFriend** está oficialmente configurado e pronto para a Google Play Store com a plataforma nativa Android!

---

## 📱 Informações do Aplicativo
- **Nome do App:** CicloFriend
- **Package ID (Application ID):** `com.ciclofriend.app`
- **Versão:** `1.0.0` (Version Code: `1`)
- **SDK Alvo (Target SDK):** `36` (Atende a todos os requisitos atuais da Google Play)
- **SDK Mínimo (Min SDK):** `24` (Compatível com 96%+ de todos os aparelhos Android ativos)
- **Permissões Declaradas:** Apenas `INTERNET` (atende às políticas de privacidade restritas da Play Store)

---

## 🚀 Passo a Passo para Gerar o Arquivo `.aab` (Android App Bundle)

A Google Play Store exige o formato **`.aab` (Android App Bundle)** assinado digitalmente.

### Opção 1: Pelo Android Studio (Recomendado)

1. **Baixar o Projeto:**
   - No menu do Google AI Studio, clique em **Export** (Exportar como ZIP) ou envie para o seu **GitHub**.
2. **Abrir no Android Studio:**
   - Abra o **Android Studio**.
   - Escolha **Open** e selecione a pasta `android` que está na raiz do projeto.
3. **Gerar o Pacote Assinado (.aab):**
   - No menu superior, vá em: **Build** > **Generate Signed Bundle / APK...**
   - Selecione **Android App Bundle (.aab)** e clique em **Next**.
   - Em *Key store path*, crie uma nova chave clicando em **Create new...** (guarde bem sua senha e o arquivo de chave!).
   - Selecione o tipo de build: **release**.
   - Clique em **Create**.
4. **Pronto!** O Android Studio vai gerar o arquivo `app-release.aab` na pasta:
   `android/app/release/app-release.aab`.

---

### Opção 2: Pela Linha de Comando (Gradle)

Se você já tem o Android SDK instalado na sua máquina:
```bash
cd android
./gradlew bundleRelease
```
O pacote `.aab` será gerado automaticamente.

---

## 📋 Checklist para o Google Play Console

Quando você acessar o [Google Play Console](https://play.google.com/console):

1. **Criar Novo App:**
   - Nome: `CicloFriend`
   - Idioma padrão: Português (Brasil)
   - Tipo: Aplicativo / Gratuito
2. **Fazer Upload do `.aab`:**
   - Vá em **Produção** (ou **Teste Fechado**) > **Criar novo lançamento**.
   - Faça o upload do arquivo `app-release.aab`.
3. **Ficha da Loja (Store Listing):**
   - **Breve descrição:** "Organize seu círculo social, encontros, aniversários e preferências dos seus amigos em um só lugar."
   - **Descrição completa:** Destacar as funções de amigos, rede de conexões, registro de gostos (bebidas, saídas, presentes) e calendário de encontros.
   - **Ícone do App:** 512x512 px (PNG).
   - **Gráfico de recursos:** 1024x500 px.
   - **Screenshots:** Capturas de tela do celular (pelo menos 4 telas).
4. **Declarações de Segurança e Privacidade:**
   - Como o aplicativo roda localmente no dispositivo (offline-first com `localStorage`), declare que o app não compartilha dados pessoais de terceiros sem consentimento.

1. Use Vite Bundler For Super Fast Dev Enviournment
   a. npm create vite@latest
   b. Choose Javascript
   c. Choose React

2. Setting up Daisy UI and tailwind css with Vite
   a.npm install tailwindcss@latest @tailwindcss/vite@latest daisyui@latest
   b. Merge vite.config.js File with this

   import { defineConfig } from 'vite';
   import tailwindcss from '@tailwindcss/vite';

   export default defineConfig({
   plugins: [
   tailwindcss()
   ],
   });

   c. Remove old content from index.css and Add 
     @import "tailwindcss";
     @plugin "daisyui";

3. Installing React Hook Form to create Forms with less work
   npm i react-hook-form

4. Installing Zod and @reacthook Form Resolver to connect ZOD with RHK
   a. npm i zod
   b. npm install @hookform/resolvers

5. Install React-router Library so that we can use Browser Router From it
   npm i react-router

6. Installing React-redux and @reduxjs/toolkit
   npm i react-redux @reduxjs/toolkit

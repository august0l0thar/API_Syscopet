require('dotenv').config();

const express = require("express");
const cors = require("cors");

const usuarioRoutes = require('./src/routes/usuarioRoutes');
const petRoutes = require('./src/routes/petRoutes');
const app = express();
const PORT = process.env.port || 3000;

//Temporário
const dns = require('dns');
const util = require('util');
const dnsLookup = util.promisify(dns.lookup);

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello Cruel World");
});

app.use('/api/v1/usuarios', usuarioRoutes);
app.use('/api/v1/pets', petRoutes);

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

//Testes temporários
app.get('/test-supabase', async (req, res) => {
  const supabase = require('./src/config/supabaseConfig');
  
  try {
    // Testa listar buckets - operação simples
    const { data, error } = await supabase.storage.listBuckets();
    
    res.json({
      url: process.env.SUPABASE_URL,
      keyDefined: !!process.env.SUPABASE_KEY,
      success: !error,
      buckets: data?.map(b => b.name),
      error: error?.message
    });
  } catch (err) {
    res.status(500).json({
      url: process.env.SUPABASE_URL,
      error: err.message
    });
  }
});

app.get('/test-bucket', async (req, res) => {
  const supabase = require('./src/config/supabaseConfig');
  
  try {
    // Tenta acessar o bucket diretamente
    const { data, error } = await supabase
      .storage
      .from('fotos-pets')
      .list();
    
    res.json({
      bucketName: 'fotos-pets',
      success: !error,
      files: data,
      error: error?.message,
      errorCode: error?.statusCode
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});

app.get('/test-dns', async (req, res) => {
  try {
    const hostname = 'sqnvwdynddytlpkscyabg.supabase.co';
    const result = await dnsLookup(hostname);
    
    res.json({
      hostname: hostname,
      resolved: true,
      ip: result.address,
      family: result.family
    });
  } catch (err) {
    res.status(500).json({
      hostname: 'sqnvwdynddytlpkscyabg.supabase.co',
      resolved: false,
      error: err.message,
      code: err.code
    });
  }
});
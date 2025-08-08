const express = require('express');
const multer = require('multer');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

// --- Configuração do Banco de Dados MongoDB ---
// Substitua pela sua string de conexão do MongoDB Atlas ou local
const mongoUrl = 'mongodb://localhost:27017'; 
const dbName = 'retrospectivasDB';
let db;

MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
    .then(client => {
        console.log('Conectado ao Banco de Dados com sucesso!');
        db = client.db(dbName);
    })
    .catch(error => console.error(error));


// --- Configuração do Armazenamento de Arquivos (Multer) ---
// Isso salva os arquivos numa pasta local chamada 'uploads'.
// Numa aplicação real, você usaria uma biblioteca para enviar para o Amazon S3 ou similar.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Cria um nome de arquivo único para evitar conflitos
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// --- Rota para receber os dados do formulário ---
app.post('/criar-retrospectiva', upload.array('media', 20), async (req, res) => {
    // 'media' é o nome do campo <input type="file">
    // 20 é o número máximo de arquivos permitidos
    if (!req.files || !db) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado ou erro de DB.' });
    }

    // Pega os dados do formulário
    const { title, message } = req.body;
    
    // Pega os caminhos dos arquivos que foram salvos
    const filePaths = req.files.map(file => file.path);

    try {
        // Salva as INFORMAÇÕES (não os arquivos) no banco de dados
        const result = await db.collection('retrospectivas').insertOne({
            title: title,
            message: message,
            mediaPaths: filePaths, // Salva a localização dos arquivos
            createdAt: new Date()
        });

        // Retorna o ID único da retrospectiva criada para o cliente
        res.status(201).json({ 
            message: 'Retrospectiva criada!', 
            id: result.insertedId 
        });

    } catch (error) {
        console.error('Erro ao salvar no banco:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});


// --- Rota para visualizar uma retrospectiva ---
app.get('/retrospectiva/:id', async (req, res) => {
    try {
        const id = new ObjectId(req.params.id);
        const retrospectiva = await db.collection('retrospectivas').findOne({ _id: id });

        if (!retrospectiva) {
            return res.status(404).send('Retrospectiva não encontrada.');
        }

        // Aqui você criaria a página HTML dinamicamente com os dados
        // Esta é uma versão simplificada que apenas mostra os dados em texto
        let html = `<h1>${retrospectiva.title}</h1>`;
        html += `<p>${retrospectiva.message}</p>`;
        retrospectiva.mediaPaths.forEach(path => {
            // Cria tags de imagem ou vídeo dependendo do tipo de arquivo
            if(path.match(/\.(jpeg|jpg|gif|png)$/)) {
                 html += `<img src="/${path}" width="500"><br><br>`;
            } else if (path.match(/\.(mp4|webm)$/)) {
                html += `<video width="500" controls><source src="/${path}"></video><br><br>`;
            }
        });
        
        res.send(html);

    } catch (error) {
        res.status(404).send('ID inválido.');
    }
});

// Servir os arquivos estáticos (HTML, JS, e a pasta de uploads)
app.use(express.static('public')); // Crie uma pasta 'public' para o index.html e client.js
app.use('/uploads', express.static('uploads')); // Permite que o browser acesse os arquivos na pasta uploads

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
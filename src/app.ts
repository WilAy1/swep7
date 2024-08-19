import express from 'express';
import cors from 'cors';
import { votersRouter } from './voters/router';
import { adminRouter } from './admin/api/router';



const app = express();
const port = 3000;

app.use(cors())
app.use(express.json());

app.use('/api/manage', adminRouter);
app.use('/api/', votersRouter);

  

app.listen(port, () => {
    return console.log(`Express server is listening at http://localhost:${port} 🚀`);
});


export default app;
const express =  require('express');

const router = express.Router();
const app = require('../index')

router.post('/my-patients', async (req, res)=> {
    console.log(req.body,'hello')
    const { mobile, } = req.body;
    const patients = await app.ESISDB.db('wellbeesis').collection('patient_records').find({mobile}).toArray();
    const count = await app.ESISDB.db('wellbeesis').collection('patient_records').find({mobile}).count()
        
    res.json({patients, count})
})

module.exports = router;
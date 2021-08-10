const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

//@author Luka

//middleware
app.use(cors());
app.use(express.json());

//Routes

//create a todo

app.post("/create-campaign", async(req, res) => {
    try{

        const { title } = req.body;
        const { description } = req.body;
        const { email } = req.body;
        const date = new Date();
        const { deadline } = req.body;
        const { goal } = req.body;
        const { currency } = req.body;
        const { category } = req.body;
        const { url } = req.body
        const newCamp = await pool.query(
            "INSERT INTO campaigns (camp_title, camp_description, camp_email, camp_url, camp_dateCreated, camp_deadline, camp_goal, camp_currency, camp_category) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *", 
            [title, description, email, url, date, deadline, goal, currency, category]
        );

        console.log(res.json(newCamp.rows[0]));

    }catch(err){
        console.log(err.message);
    }
});

//get all campaigns

app.get("/campaigns", async (req, res) => {
    try{
        const allCampaigns = await pool.query("SELECT * FROM campaigns");
        res.json(allCampaigns.rows);
    }catch(error){
        console.log(error.message);
    }
})

//get a campaign

app.get("/campaigns/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const camp = await pool.query("SELECT * FROM campaigns WHERE camp_id = $1", [id]);

        res.json(camp.rows[0]);
    } catch (error) {
        console(error.message);
    }
})

//donate to a campaign

app.put("/campaigns/:id", async (req, res) =>{
    try {
        const { id } = req.params;
        const { raised } = req.body;
        const donate = await pool.query(
            "UPDATE campaigns SET camp_raised = $1 WHERE camp_id = $2",
            [raised, id]
        );

        res.json("DONATED TO A CAMPAIGN");
    } catch (error) {
        console.log(error.message);
    }
})

app.put("/campaigns/:id/finish", async (req, res) =>{
    try {
        const { id } = req.params;
        const { isFinished } = req.body;
        const change = await pool.query(
            "UPDATE campaigns SET camp_isFinished = $1 WHERE camp_id = $2",
            [isFinished, id]
        );

        res.json("FINISHED A CAMPAIGN");
    } catch (error) {
        console.log(error.message);
    }
})

// //delete a todo

// app.delete("/todos/:id", async (req, res) => {
//     try {
//         const {id} = req.params;
//         const deleteTodo = await pool.query("DELETE FROM todo WHERE todo_id = $1", [id]);

//         res.json("TODO WAS DELETED");
//     } catch (error) {
//         console.log(error.message);
//     }
// })


app.listen(5000, () => {
    console.log("Server has started on port 5000");
})
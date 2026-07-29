import { query } from "../db.js"

const SELECT_TICKET = `
    SELECT
            t.id, 
            t.subject, 
            t.description, 
            t.status, 
            t.priority, 
            t.created_at, 
            t.updated_at, 
            r.email AS requester_email,
            r.name AS requester_name,
            a.email AS assignee_email,
            a.name AS assignee_name
        FROM tickets t
        JOIN users r ON r.id = t.requester_id
        LEFT JOIN users a ON a.id = t.assignee_id
    `;

//findAll
export async function findAll(){
    const { rows } = await query(
        `${SELECT_TICKET}
            ORDER BY
                CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
                t.created_at`
    )
    return rows;
}

//findById
export async function findById(id){
    const { rows } = await query(
        `${SELECT_TICKET}
        WHERE t.id = $1`,
        [id]
    );
    return rows[0]
}

//countAll
export async function countAll(){
    const { rows } = await query(
        `SELECT COUNT (*) AS count
        FROM tickets`
    );
    return Number(rows[0].count)
}

//countByStatus
export async function countByStatus(status) {
    const { rows } = await query(
        `SELECT COUNT (*) AS count
        FROM tickets t
        WHERE t.status = $1` , [status]
    )
    return Number(rows[0].count)
}

// //findTicketsByStatus
// export async function findTicketsByStatus(status){
//     const { rows } = await query(
//         `${SELECT_TICKET}
//         WHERE t.status = $1
//         ORDER BY t.created_at` , 
//         [status]
//     )
//     return rows
// }

// //findTicketsByPriority
// export async function findTicketsByPriority(priority){
//     const { rows } = await query(
//         `${SELECT_TICKET}
//         WHERE t.priority = $1` ,
//         [priority]
//     );
//     return rows
// }

// //findTicketsByAssigneeName
// export async function findTicketsByAssigneeName(assigneeName){
//     const { rows } = await query(
//         `${SELECT_TICKET}
//         WHERE a.name = $1` ,
//         [assigneeName]
//     );
//     return rows
// }

// //findTicketByAssigneeEmail
// export async function findTicketByAssigneeEmail(assigneeEmail){
//     const { rows } = await query(`
//         `)
// }
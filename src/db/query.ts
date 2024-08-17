import { Condition, ConditionChild, DBQueryReturnType, DBSelectParams } from "../interface/db.interface";
import { makeObjectUnique } from "../utils/makeObjectUnique";
import pool from "./connect";

class Query {
    table: string;
    
     constructor(table: string){
        this.table = table;
    }

    /**
     * 
     * @param conditions 
     * @param keysLength - length of keys and values
     * @returns 
     */

    private generateCondition(conditions: Condition, keysLength: number = 0): string {
        
        const optionalLength : number = conditions.optional?.length || 0;

        const compulsoryConditions = conditions.compulsory?.map((key, index) => `${key.key} = $${keysLength + optionalLength + index + 1}`);
        const optionalConditions = conditions.optional?.map((key, index) => `${key.key} = $${keysLength + index + 1}`);

        let conditionStatement : string;

        if(optionalConditions && compulsoryConditions) {
             conditionStatement = `WHERE (${optionalConditions.join(' OR ')}) OR (${compulsoryConditions.join(' AND ')})`;
        }
        else if (optionalConditions) {
            conditionStatement = `WHERE (${optionalConditions.join(' OR ')})`;
        }
        else if (compulsoryConditions) {
            conditionStatement = `WHERE (${compulsoryConditions.join(' AND ')})`;   
        }
        else {
            conditionStatement = "";
        }

        return conditionStatement;
    }

    private generateSelectQuery (cols?: string[], conditions?: Condition) : DBQueryReturnType {
        const selectFrom = cols?.join(', ') || "*";
        let conditionStatement : string = "";
        let conditionValues : unknown[] = [];
        if(conditions) {
            conditionStatement = this.generateCondition(conditions);
            conditionValues = (conditions.optional?.map((key, _) => key.value) || [])
            .concat((conditions.compulsory?.map((key, _)=> key.value)) || []);
        }

        const query = `SELECT ${selectFrom} FROM ${this.table} ${conditionStatement}`; 


        return {
            query : query,
            conditionValues: conditionValues
        }
    }
    
    private generateInsertQuery(keys: unknown[], values: unknown[]): string {
        const placeholders = values.map((_, index) => `$${index + 1}`);
        const columns = keys.join(', ');
        const placeholdersString = placeholders.join(', ');
    
        return `INSERT INTO ${this.table} (${columns}) VALUES (${placeholdersString})`;
    }


    private generateUpdateQuery(keys: unknown[], conditions: Condition) : DBQueryReturnType {
        const assignment = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        

        const conditionStatement = this.generateCondition(conditions, keys.length);

        const query = `UPDATE ${this.table} SET ${assignment} ${conditionStatement}`;
        

        const conditionValues = (conditions.optional?.map((key, _) => key.value) || [])
                                    .concat((conditions.compulsory?.map((key, _)=> key.value)) || []);

        return {
            query: query,
            conditionValues: conditionValues
        };
    }

    private generateDeleteQuery(conditions: Condition) : DBQueryReturnType {
        const conditionMerged : ConditionChild[] = (conditions.optional || []).concat(conditions.compulsory || []);

        //const cols = conditionMerged
        //                .map((key, _) => `${key.key}`)
                        //.filter((value, index, array) => array.indexOf(value) == index);

        const mergedCols = makeObjectUnique(conditionMerged)

        const cols = Object.keys(mergedCols).join(', ');
        
        //placeholder
        let placeholderValue = 0;
        const varPlaceholders = Object.values(mergedCols).map((value) => {
                      
            return `(${value.map((_) => {
                placeholderValue += 1;
                const inner = `$${placeholderValue}`
                return inner;
            }

            ).join(',')})`
             
        }).join(', ')

        const vars = Object.values(mergedCols).map((value) => value.join(', '))

        const conditionStatement = cols && vars ? `WHERE (${cols}) IN (${varPlaceholders})` : ''

        const query = `DELETE FROM ${this.table} ${conditionStatement}`;

        return {
            query: query,
            conditionValues: vars
        };
    }


    // global

    async update(keys: unknown[], values: unknown[], conditions: Condition) : Promise<boolean> {
        try {
            if(keys.length == 0 && keys.length != values.length && !(conditions.compulsory || conditions.optional)) {
                throw new Error("Length of keys doesn't match length of values or no condition provided");
            }
            const generateQuery: DBQueryReturnType = this.generateUpdateQuery(keys, conditions);

            await pool.query(generateQuery.query, values.concat(generateQuery.conditionValues))

            return true;

        }
        catch(error) {
            console.error(error);
            return false;
        }
    }


    async insert(keys: string[], values: unknown[]) : Promise<boolean> {
        try {
            if(keys.length == 0 && keys.length != values.length) {
                throw new Error("Length of keys doesn't match length of values");
            }

            const query : string = this.generateInsertQuery(keys, values);
            await pool.query(query, values); // insert into table


            return true;

        }
        catch (error) {
            // failed to insert
            console.error(error);
            return false;
        }
    }

    async delete(conditions: Condition) : Promise<boolean> {
        try {
            
            const deleteCondition = this.generateCondition(conditions);

            const query = `DELETE FROM ${this.table} ${deleteCondition}`;
            
            const conditionValues = (conditions.optional?.map((key, _) => key.value) || [])
                                    .concat((conditions.compulsory?.map((key, _)=> key.value)) || []);

            await pool.query(query, conditionValues); // delete in table


            return true

        }
        catch(error) {
            console.error(error);
            return false;
        }
    }


    async select( params: DBSelectParams ) : Promise<Array<unknown>> {
        try {
            
            const generateQuery : DBQueryReturnType = this.generateSelectQuery(params.cols, params.conditions)

            const result = await pool.query(generateQuery.query, generateQuery.conditionValues)

            return result.rows;
        }
        catch(error){
            console.error(error);
            return [];
        }
    }

    async customQuery(query: string, values: Array<string | boolean | number>) : Promise<unknown> {
        try {
            const result = await pool.query(query, values);
            return result;
        }
        catch(error) {
            console.error(error);
            return;
        }
    }

}

export default Query;



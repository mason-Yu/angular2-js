import { InMemoryDbService } from "angular-in-memory-web-api";
import { chassisList }       from "../testing/fake-chassis";

export class InMemoryDataService implements InMemoryDbService {
   createDb() {
      return { chassisList };
   }
}

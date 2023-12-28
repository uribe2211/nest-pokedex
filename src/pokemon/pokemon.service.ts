import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  /**
   *
   */
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {

    try {

      createPokemonDto.name=createPokemonDto.name.toLowerCase();

      const pokemon = await this.pokemonModel.create(createPokemonDto);
  
      return  pokemon;

    }catch (error) {
      this.handleExceptions(error);
    }
    
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
   
    let pokemon:Pokemon;

    if(!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne( {no : term} );
    }

    if(!pokemon && isValidObjectId(term) ){
        pokemon = await this.pokemonModel.findById( term );
    }

    if( !pokemon ){
      pokemon = await this.pokemonModel.findOne( {name: term.toLowerCase().trim()} );
    }

    if(!pokemon ){
      throw new NotFoundException(`Pokemon not found ${term}`);
    }

      return pokemon;

  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const Pokemon = await this.findOne( term );

    if(updatePokemonDto.name)
      updatePokemonDto.name=updatePokemonDto.name.toLowerCase();
    
      try {
      
      await Pokemon.updateOne(updatePokemonDto,{new:true});
      return { ...Pokemon.toJSON(), ...updatePokemonDto};

    } catch (error) {
      this.handleExceptions(error);
    }                
  }

  async remove(id: string) {
    
    const {deletedCount}=await this.pokemonModel.deleteOne({_id:id});

    if(deletedCount===0){
      throw new BadRequestException(`Pokemon not found ${id}`);
    }

    return deletedCount;

  }

  private handleExceptions(error: any) {

    if(error.code === 11000) {
      throw new BadRequestException(`Pokemon already exists ${ JSON.stringify( error.keyValue )}`);
    }
    console.log(error);
    throw new InternalServerErrorException('Internal Server Error');

  }
}
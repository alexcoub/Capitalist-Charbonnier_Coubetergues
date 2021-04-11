package com.example.CapitalistAG;

import com.example.CapitalistAG.generated.PallierType;
import com.example.CapitalistAG.generated.ProductType;
import com.example.CapitalistAG.generated.World;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.xml.bind.JAXBException;
import java.io.FileNotFoundException;
import java.io.IOException;



@Path("generic")
public class Webservice {
    Services services;
    public Webservice(){
            services =new Services();
        }
    @GET
    @Path("world")
    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public Response getXml(@Context HttpServletRequest request) throws JAXBException, FileNotFoundException, IOException {
        String username;
        username = request.getHeader("X-user");
        return Response.ok(services.getWorld(username)).build();
    }

    @PUT
    @Path("world")
    public void putWorld(@Context HttpServletRequest request, World world) throws JAXBException, IOException {
        String username = request.getHeader("X-user");
        services.saveWordlToXml(world, username);
        //System.out.println(world+username);
    }

    @DELETE
    @Path("world")
    public void deleteWorld (@Context HttpServletRequest request) throws JAXBException, IOException{
        String username = request.getHeader("X-user");
        services.deleteWorld(username);
    }


   @PUT
    @Path("product")
    public void putProduct(@Context HttpServletRequest request, ProductType product) throws JAXBException, IOException {
        String username = request.getHeader("X-user");
        services.updateProduct(username, product);
    }

    @PUT
    @Path("manager")
    public void putManager(@Context HttpServletRequest request, PallierType manager) throws JAXBException, IOException {
        String username = request.getHeader("X-user");
        services.updateManager(username, manager);
    }

    @PUT
    @Path("upgrade")
    public void putUpgrade(@Context HttpServletRequest request, PallierType upgrade) throws JAXBException, IOException {
        String username = request.getHeader("X-user");
        services.updateUpgrades(username, upgrade);
    }

    @PUT
    @Path("angelupgrade")
    public void angelUpgrade(@Context HttpServletRequest request, PallierType ange) throws JAXBException, IOException {
        String username = request.getHeader("X-user");
        services.angelUpgrade(username, ange);
    }
    }

